import pytest
from app.db.models import User

def test_register(client, test_db):
    """Test user registration endpoint"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "password123",
            "first_name": "New",
            "last_name": "User",
            "dietary_preference_id": 1,
            "cuisine_preference_id": 1
        }
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Check if user was created in DB
    user = test_db.query(User).filter(User.email == "newuser@example.com").first()
    assert user is not None
    assert user.first_name == "New"
    assert user.last_name == "User"
    assert len(user.dietary_preferences) == 1
    assert len(user.preferred_cuisines) == 1

def test_register_existing_email(client, test_user):
    """Test registration with an existing email should fail"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_user["email"],  # Using existing email
            "password": "password123",
            "first_name": "Another",
            "last_name": "User",
            "dietary_preference_id": 1,
            "cuisine_preference_id": 1
        }
    )
    
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login(client, test_user):
    """Test login endpoint"""
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials should fail"""
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user["email"],
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_oauth_token(client, test_user):
    """Test OAuth2 token endpoint"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": test_user["email"],
            "password": test_user["password"]
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"