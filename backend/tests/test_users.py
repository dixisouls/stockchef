import pytest

def test_get_current_user_profile(client, auth_headers, test_user):
    """Test getting current user profile"""
    response = client.get("/api/users/me", headers=auth_headers)
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["first_name"] == "Test"
    assert data["last_name"] == "User"
    assert len(data["dietary_preferences"]) == 1
    assert len(data["preferred_cuisines"]) == 1
    assert data["dietary_preferences"][0]["name"] == "Vegetarian"
    assert data["preferred_cuisines"][0]["name"] == "Italian"

def test_get_current_user_unauthenticated(client):
    """Test getting user profile without authentication should fail"""
    response = client.get("/api/users/me")
    
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_get_preferences(client):
    """Test getting available dietary preferences and cuisines"""
    response = client.get("/api/users/preferences")
    
    assert response.status_code == 200
    
    data = response.json()
    assert "dietary_preferences" in data
    assert "cuisines" in data
    assert len(data["dietary_preferences"]) >= 2  # We created 2 in the fixture
    assert len(data["cuisines"]) >= 2  # We created 2 in the fixture

def test_update_preferences(client, auth_headers, test_db, test_user):
    """Test updating user preferences"""
    response = client.put(
        "/api/users/preferences",
        headers=auth_headers,
        json={
            "dietary_preference_id": 2,  # Non-vegetarian
            "cuisine_preference_id": 2   # Indian
        }
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["dietary_preferences"]) == 1
    assert len(data["preferred_cuisines"]) == 1
    assert data["dietary_preferences"][0]["name"] == "Non-vegetarian"
    assert data["preferred_cuisines"][0]["name"] == "Indian"

def test_update_preferences_invalid_ids(client, auth_headers):
    """Test updating preferences with invalid IDs should fail"""
    response = client.put(
        "/api/users/preferences",
        headers=auth_headers,
        json={
            "dietary_preference_id": 999,  # Non-existent ID
            "cuisine_preference_id": 1
        }
    )
    
    assert response.status_code == 400
    assert "Invalid dietary preference" in response.json()["detail"]
    
    response = client.put(
        "/api/users/preferences",
        headers=auth_headers,
        json={
            "dietary_preference_id": 1,
            "cuisine_preference_id": 999  # Non-existent ID
        }
    )
    
    assert response.status_code == 400
    assert "Invalid cuisine preference" in response.json()["detail"]