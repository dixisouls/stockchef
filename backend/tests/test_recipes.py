import pytest
from unittest.mock import patch
from app.db.models import UserRecipeHistory

def test_get_recipe_history(client, auth_headers, test_db, test_user, test_recipe):
    """Test getting user's recipe history"""
    # Add recipe to user's history
    history = UserRecipeHistory(
        user_id=test_user["user_id"], 
        recipe_id=test_recipe.recipe_id,
        cooked=False
    )
    test_db.add(history)
    test_db.commit()
    
    response = client.get("/api/recipes/history", headers=auth_headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Pasta"
    assert data[0]["short_description"] == "A simple pasta recipe for testing"

def test_get_recipe_history_empty(client, auth_headers):
    """Test getting empty recipe history"""
    response = client.get("/api/recipes/history", headers=auth_headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 0
    assert isinstance(data, list)

def test_get_recipe_detail(client, auth_headers, test_recipe):
    """Test getting details of a specific recipe"""
    response = client.get(f"/api/recipes/{test_recipe.recipe_id}", headers=auth_headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "Test Pasta"
    assert data["short_description"] == "A simple pasta recipe for testing"
    assert data["instructions"] == "1. Boil pasta\n2. Add sauce\n3. Serve"
    assert data["total_time_minutes"] == 30
    assert len(data["ingredients"]) == 3
    assert any(ing["ingredient_name"] == "Pasta" for ing in data["ingredients"])
    assert any(ing["ingredient_name"] == "Tomato" for ing in data["ingredients"])
    assert any(ing["ingredient_name"] == "Onion" for ing in data["ingredients"])

def test_get_nonexistent_recipe(client, auth_headers):
    """Test getting a non-existent recipe should fail"""
    response = client.get("/api/recipes/999", headers=auth_headers)
    
    assert response.status_code == 404
    assert "Recipe not found" in response.json()["detail"]

def test_suggest_recipes(client, auth_headers, test_inventory, monkeypatch):
    """Test suggesting recipes based on user's inventory"""
    # Mock the generate_recipes function
    with patch("app.api.recipes.generate_recipes") as mock_generate:
        # Configure the mock
        mock_generate.return_value = {
            "status": 200,
            "recipes": [
                {
                    "status": 200,
                    "recipe_name": "Tomato Pasta",
                    "description": "A simple tomato pasta recipe",
                    "ingredients": ["Pasta", "Tomato", "Onion"],
                    "approx_time": "30 minutes",
                    "steps": ["Boil pasta", "Make sauce", "Combine and serve"]
                }
            ]
        }
        
        response = client.post(
            "/api/recipes/suggest",
            headers=auth_headers,
            json={}  # Empty request means use user's inventory
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["recipe_name"] == "Tomato Pasta"
        assert data[0]["description"] == "A simple tomato pasta recipe"
        assert set(data[0]["ingredients"]) == {"Pasta", "Tomato", "Onion"}
        assert data[0]["approx_time"] == "30 minutes"
        assert len(data[0]["steps"]) == 3

def test_suggest_recipes_custom_ingredients(client, auth_headers, monkeypatch):
    """Test suggesting recipes with custom ingredients"""
    # Mock the generate_recipes function
    with patch("app.api.recipes.generate_recipes") as mock_generate:
        # Configure the mock
        mock_generate.return_value = {
            "status": 200,
            "recipes": [
                {
                    "status": 200,
                    "recipe_name": "Chicken Rice",
                    "description": "A simple chicken and rice dish",
                    "ingredients": ["Chicken", "Rice"],
                    "approx_time": "45 minutes",
                    "steps": ["Cook rice", "Cook chicken", "Combine and serve"]
                }
            ]
        }
        
        response = client.post(
            "/api/recipes/suggest",
            headers=auth_headers,
            json={"custom_ingredients": ["Chicken", "Rice"], "ignore_history": True}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["recipe_name"] == "Chicken Rice"
        assert data[0]["description"] == "A simple chicken and rice dish"
        assert set(data[0]["ingredients"]) == {"Chicken", "Rice"}
        assert data[0]["approx_time"] == "45 minutes"
        assert len(data[0]["steps"]) == 3
        
        # Check that the custom ingredients were passed to the generate_recipes function
        args, kwargs = mock_generate.call_args
        assert "Chicken" in kwargs["ingredients"]
        assert "Rice" in kwargs["ingredients"]

def test_suggest_recipes_no_results(client, auth_headers, monkeypatch):
    """Test suggesting recipes when no recipes can be generated"""
    # Mock the generate_recipes function to return no results
    with patch("app.api.recipes.generate_recipes") as mock_generate:
        # Configure the mock
        mock_generate.return_value = {"status": 400, "recipes": []}
        
        response = client.post(
            "/api/recipes/suggest",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 200
        assert response.json() == []

def test_create_recipe(client, auth_headers, test_db, test_user):
    """Test creating a new recipe"""
    response = client.post(
        "/api/recipes/create",
        headers=auth_headers,
        json={
            "recipe_name": "New Recipe",
            "description": "A brand new recipe",
            "ingredients": ["Ingredient1", "Ingredient2"],
            "approx_time": "25 minutes",
            "steps": ["Step 1", "Step 2", "Step 3"]
        }
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "New Recipe"
    assert data["short_description"] == "A brand new recipe"
    assert "instructions" in data
    assert data["total_time_minutes"] == 25
    assert len(data["ingredients"]) == 2
    
    # Check if recipe was added to user's history
    history = test_db.query(UserRecipeHistory).filter(
        UserRecipeHistory.user_id == test_user["user_id"],
        UserRecipeHistory.recipe_id == data["recipe_id"]
    ).first()
    
    assert history is not None
    assert history.cooked == False

def test_cook_recipe(client, auth_headers, test_db, test_user, test_recipe, test_inventory):
    """Test marking a recipe as cooked"""
    # First, add recipe to user's history
    history = UserRecipeHistory(
        user_id=test_user["user_id"], 
        recipe_id=test_recipe.recipe_id,
        cooked=False
    )
    test_db.add(history)
    test_db.commit()
    
    response = client.post(
        f"/api/recipes/{test_recipe.recipe_id}/cook",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["message"] == "Recipe cooked successfully"
    assert data["ingredients_used"] > 0  # Should have used some ingredients
    
    # Check if recipe is marked as cooked
    history = test_db.query(UserRecipeHistory).filter(
        UserRecipeHistory.user_id == test_user["user_id"],
        UserRecipeHistory.recipe_id == test_recipe.recipe_id
    ).first()
    
    assert history is not None
    assert history.cooked == True
    
    # Check if ingredients were removed from inventory
    response = client.get("/api/inventory/", headers=auth_headers)
    inventory = response.json()
    
    # The inventory should have fewer items now
    assert len(inventory) < 3  # Started with 3 items

def test_cook_nonexistent_recipe(client, auth_headers):
    """Test cooking a non-existent recipe should fail"""
    response = client.post(
        "/api/recipes/999/cook",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "Recipe not found" in response.json()["detail"]