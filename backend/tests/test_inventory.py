import pytest
import io
import app.utils.gemini
import app.db.models
from PIL import Image
from unittest.mock import patch

def test_get_inventory(client, auth_headers, test_inventory):
    """Test getting user inventory"""
    response = client.get("/api/inventory/", headers=auth_headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 3  # We created 3 items in the fixture
    assert any(item["name"] == "Tomato" for item in data)
    assert any(item["name"] == "Onion" for item in data)
    assert any(item["name"] == "Pasta" for item in data)

def test_get_inventory_unauthenticated(client):
    """Test getting inventory without authentication should fail"""
    response = client.get("/api/inventory/")
    
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_add_inventory_item(client, auth_headers):
    """Test adding a single item to inventory"""
    response = client.post(
        "/api/inventory/item",
        headers=auth_headers,
        json={"name": "Cheese"}
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Cheese"
    assert "item_id" in data
    assert "user_id" in data
    assert "added_at" in data
    assert "updated_at" in data

def test_add_duplicate_inventory_item(client, auth_headers, test_inventory):
    """Test adding a duplicate item to inventory"""
    response = client.post(
        "/api/inventory/item",
        headers=auth_headers,
        json={"name": "Tomato"}  # Already exists in test_inventory
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == "Tomato"

def test_remove_inventory_item(client, auth_headers, test_inventory):
    """Test removing an item from inventory"""
    # Get the first item from test_inventory
    item_id = test_inventory[0].item_id
    
    response = client.delete(f"/api/inventory/item/{item_id}", headers=auth_headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["message"] == "Item removed successfully"
    
    # Verify the item is removed
    response = client.get("/api/inventory/", headers=auth_headers)
    data = response.json()
    assert len(data) == 2  # One less than the 3 we created

def test_remove_nonexistent_inventory_item(client, auth_headers):
    """Test removing a non-existent item from inventory"""
    response = client.delete("/api/inventory/item/999", headers=auth_headers)
    
    assert response.status_code == 404
    assert "Item not found" in response.json()["detail"]

def test_update_multiple_inventory_items(client, auth_headers):
    """Test updating inventory with multiple items at once"""
    response = client.post(
        "/api/inventory/update-multiple",
        headers=auth_headers,
        json={"items": ["Cheese", "Milk", "Eggs"]}
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert "items_added" in data
    assert data["items_added"] == 3
    
    # Verify the items were added
    response = client.get("/api/inventory/", headers=auth_headers)
    inventory = response.json()
    assert any(item["name"] == "Cheese" for item in inventory)
    assert any(item["name"] == "Milk" for item in inventory)
    assert any(item["name"] == "Eggs" for item in inventory)

def test_update_multiple_with_existing_items(client, auth_headers, test_inventory):
    """Test updating with items that already exist in inventory"""
    response = client.post(
        "/api/inventory/update-multiple",
        headers=auth_headers,
        json={"items": ["Tomato", "Onion", "Cheese"]}  # Tomato and Onion already exist
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["items_added"] == 1  # Only Cheese should be added
    
    # Verify Cheese was added
    response = client.get("/api/inventory/", headers=auth_headers)
    inventory = response.json()
    assert any(item["name"] == "Cheese" for item in inventory)
    assert len(inventory) == 4  # 3 original items + 1 new item

def test_upload_inventory_image(client, auth_headers, monkeypatch):
    """Test updating inventory from image"""
    # Mock the extract_items_from_image function using patch
    with patch("app.api.inventory.extract_items_from_image") as mock_extract:
        # Configure the mock to return our test data
        mock_extract.return_value = {"status": "200", "items": ["Apple", "Banana", "Orange"]}
    
    # Create a test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    response = client.post(
        "/api/inventory/upload-image",
        headers=auth_headers,
        files={"file": ("test.jpg", img_byte_arr, "image/jpeg")}
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert "items_added" in data
    assert data["items_added"] == 3
    assert data["total_items_detected"] == 3
    assert "Apple" in data["detected_items"]
    assert "Banana" in data["detected_items"]
    assert "Orange" in data["detected_items"]

def test_upload_inventory_image_no_food(client, auth_headers, test_db):
    """Test uploading image with no food detected"""
    # Skip this test if GEMINI_API_KEY is not set
    import os
    if not os.environ.get("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set, skipping test that requires API access")
    
    # Create a test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    # Mock the entire function with a decorator pattern
    original_extract = app.utils.gemini.extract_items_from_image
    
    try:
        # Replace the function with our mock
        def mock_extract(*args, **kwargs):
            return {"status": "404", "items": []}
        
        app.utils.gemini.extract_items_from_image = mock_extract
        
        # Make the request after replacing the function
        response = client.post(
            "/api/inventory/upload-image",
            headers=auth_headers,
            files={"file": ("test.jpg", img_byte_arr, "image/jpeg")}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "No food items detected" in data["message"]
        assert data["items_added"] == 0
    
    finally:
        # Restore the original function even if test fails
        app.utils.gemini.extract_items_from_image = original_extract