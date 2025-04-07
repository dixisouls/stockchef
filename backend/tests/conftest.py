import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.utils.security import create_access_token
from app.db.models import User, DietaryPreference, Cuisine, Recipe, InventoryItem, RecipeIngredient
from app.config import settings

# Create a test database in-memory
TEST_DATABASE_URL = "sqlite:///:memory:"

# Create the test database engine with specific configurations for SQLite in-memory
engine = create_engine(
    TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# Create test session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sample test data
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "password123"

@pytest.fixture(scope="function")
def test_db():
    """Create test database tables and drop them after the test"""
    Base.metadata.create_all(bind=engine)
    
    # Create test data
    db = TestingSessionLocal()
    
    # Create dietary preferences
    veg = DietaryPreference(preference_id=1, name="Vegetarian", description="No meat, may include dairy but not eggs")
    non_veg = DietaryPreference(preference_id=2, name="Non-vegetarian", description="No restrictions on meat")
    
    db.add(veg)
    db.add(non_veg)
    
    # Create cuisines
    italian = Cuisine(cuisine_id=1, name="Italian")
    indian = Cuisine(cuisine_id=2, name="Indian")
    
    db.add(italian)
    db.add(indian)
    
    db.commit()
    
    yield db
    
    # Drop tables after test
    Base.metadata.drop_all(bind=engine)
    
@pytest.fixture(scope="function")
def client(test_db):
    """Test client with database dependency overridden"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(test_db):
    """Create a test user and return credentials"""
    from app.utils.security import get_password_hash
    
    hashed_password = get_password_hash(TEST_USER_PASSWORD)
    user = User(
        email=TEST_USER_EMAIL,
        password_hash=hashed_password,
        first_name="Test",
        last_name="User"
    )
    
    # Add dietary preferences and cuisines
    veg = test_db.query(DietaryPreference).filter(DietaryPreference.name == "Vegetarian").first()
    italian = test_db.query(Cuisine).filter(Cuisine.name == "Italian").first()
    
    user.dietary_preferences.append(veg)
    user.preferred_cuisines.append(italian)
    
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    return {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "user_id": user.user_id
    }

@pytest.fixture(scope="function")
def auth_token(test_user):
    """Create an authentication token for the test user"""
    token = create_access_token(data={"sub": test_user["email"]})
    return token

@pytest.fixture(scope="function")
def auth_headers(auth_token):
    """Create authorization headers with the JWT token"""
    return {"Authorization": f"Bearer {auth_token}"}

@pytest.fixture(scope="function")
def test_inventory(test_db, test_user):
    """Create test inventory items for the test user"""
    items = [
        InventoryItem(user_id=test_user["user_id"], name="Tomato"),
        InventoryItem(user_id=test_user["user_id"], name="Onion"),
        InventoryItem(user_id=test_user["user_id"], name="Pasta")
    ]
    
    for item in items:
        test_db.add(item)
    
    test_db.commit()
    
    return items

@pytest.fixture(scope="function")
def test_recipe(test_db, test_user):
    """Create a test recipe"""
    recipe = Recipe(
        title="Test Pasta",
        short_description="A simple pasta recipe for testing",
        instructions="1. Boil pasta\n2. Add sauce\n3. Serve",
        total_time_minutes=30
    )
    
    test_db.add(recipe)
    test_db.flush()
    
    # Add ingredients
    ingredients = [
        RecipeIngredient(recipe_id=recipe.recipe_id, ingredient_name="Pasta"),
        RecipeIngredient(recipe_id=recipe.recipe_id, ingredient_name="Tomato"),
        RecipeIngredient(recipe_id=recipe.recipe_id, ingredient_name="Onion")
    ]
    
    for ingredient in ingredients:
        test_db.add(ingredient)
    
    test_db.commit()
    test_db.refresh(recipe)
    
    return recipe