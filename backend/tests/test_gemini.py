import pytest
import json
from unittest.mock import patch, MagicMock

from app.utils.gemini import extract_items_from_image, generate_recipes


@pytest.fixture
def mock_genai_client():
    """Create a mock for the Gemini API client"""
    with patch("app.utils.gemini.client") as mock_client:
        yield mock_client


def test_extract_items_from_image(mock_genai_client):
    """Test extracting items from an image"""
    # Mock response
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "status": "200",
        "items": ["Apple", "Banana", "Orange"]
    })
    mock_genai_client.models.generate_content.return_value = mock_response
    
    # Call the function with dummy image data
    result = extract_items_from_image(b"dummy_image_data")
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == "200"
    assert len(result["items"]) == 3
    assert "Apple" in result["items"]
    assert "Banana" in result["items"]
    assert "Orange" in result["items"]


def test_extract_items_from_image_no_food(mock_genai_client):
    """Test extracting items from an image with no food"""
    # Mock response
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "status": "404",
        "items": []
    })
    mock_genai_client.models.generate_content.return_value = mock_response
    
    # Call the function with dummy image data
    result = extract_items_from_image(b"dummy_image_data")
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == "404"
    assert len(result["items"]) == 0


def test_extract_items_from_image_error(mock_genai_client):
    """Test handling errors during image extraction"""
    # Mock response that raises an exception
    mock_genai_client.models.generate_content.side_effect = Exception("API Error")
    
    # Call the function with dummy image data
    result = extract_items_from_image(b"dummy_image_data")
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == "404"
    assert len(result["items"]) == 0


def test_generate_recipes(mock_genai_client):
    """Test generating recipes"""
    # Mock response
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "status": 200,
        "recipes": [
            {
                "status": 200,
                "recipe_name": "Pasta Recipe",
                "description": "A simple pasta recipe",
                "ingredients": ["Pasta", "Tomato", "Onion"],
                "approx_time": "30 minutes",
                "steps": ["Step 1", "Step 2", "Step 3"]
            }
        ]
    })
    mock_genai_client.models.generate_content.return_value = mock_response
    
    # Call the function
    result = generate_recipes(
        ingredients=["Pasta", "Tomato", "Onion"],
        dietary_preference="Vegetarian",
        cuisine_preference="Italian",
        previous_recipes=[]
    )
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == 200
    assert len(result["recipes"]) == 1
    assert result["recipes"][0]["recipe_name"] == "Pasta Recipe"
    assert result["recipes"][0]["description"] == "A simple pasta recipe"
    assert len(result["recipes"][0]["ingredients"]) == 3
    assert result["recipes"][0]["approx_time"] == "30 minutes"
    assert len(result["recipes"][0]["steps"]) == 3


def test_generate_recipes_no_ingredients(mock_genai_client):
    """Test generating recipes with no ingredients"""
    # Mock response
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "status": 400,
        "recipes": []
    })
    mock_genai_client.models.generate_content.return_value = mock_response
    
    # Call the function
    result = generate_recipes(
        ingredients=[],
        dietary_preference="Vegetarian",
        cuisine_preference="Italian",
        previous_recipes=[]
    )
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == 400
    assert len(result["recipes"]) == 0


def test_generate_recipes_error(mock_genai_client):
    """Test handling errors during recipe generation"""
    # Mock response that raises an exception
    mock_genai_client.models.generate_content.side_effect = Exception("API Error")
    
    # Call the function
    result = generate_recipes(
        ingredients=["Pasta", "Tomato", "Onion"],
        dietary_preference="Vegetarian",
        cuisine_preference="Italian",
        previous_recipes=[]
    )
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == 400
    assert len(result["recipes"]) == 0


def test_generate_recipes_json_decode_error(mock_genai_client):
    """Test handling JSON decode errors in recipe generation"""
    # Mock response with invalid JSON
    mock_response = MagicMock()
    mock_response.text = "This is not valid JSON"
    mock_genai_client.models.generate_content.return_value = mock_response
    
    # Call the function
    result = generate_recipes(
        ingredients=["Pasta", "Tomato", "Onion"],
        dietary_preference="Vegetarian",
        cuisine_preference="Italian",
        previous_recipes=[]
    )
    
    # Assertions
    assert mock_genai_client.models.generate_content.called
    assert result["status"] == 400
    assert len(result["recipes"]) == 0