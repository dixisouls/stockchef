from datetime import datetime
from uuid import uuid4

from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer, String,
                        Table, Text)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

# Association tables for many-to-many relationships

# User dietary preferences association table
user_dietary_preferences = Table(
    'user_dietary_preferences',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True),
    Column('preference_id', Integer, ForeignKey('dietary_preferences.preference_id'), primary_key=True)
)

# User preferred cuisines association table
user_preferred_cuisines = Table(
    'user_preferred_cuisines',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True),
    Column('cuisine_id', Integer, ForeignKey('cuisines.cuisine_id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    dietary_preferences = relationship("DietaryPreference", secondary=user_dietary_preferences)
    preferred_cuisines = relationship("Cuisine", secondary=user_preferred_cuisines)
    inventory_items = relationship("InventoryItem", back_populates="user")
    recipe_history = relationship("UserRecipeHistory", back_populates="user")

class DietaryPreference(Base):
    __tablename__ = "dietary_preferences"
    
    preference_id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)

class Cuisine(Base):
    __tablename__ = "cuisines"
    
    cuisine_id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    item_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="inventory_items")

class Recipe(Base):
    __tablename__ = "recipes"
    
    recipe_id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    short_description = Column(Text)
    instructions = Column(Text, nullable=False)
    total_time_minutes = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    user_history = relationship("UserRecipeHistory", back_populates="recipe")

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"
    
    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id", ondelete="CASCADE"), primary_key=True)
    ingredient_name = Column(String(100), primary_key=True)
    
    # Relationships
    recipe = relationship("Recipe", back_populates="ingredients")

class UserRecipeHistory(Base):
    __tablename__ = "user_recipe_history"
    
    history_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    recipe_id = Column(Integer, ForeignKey("recipes.recipe_id", ondelete="SET NULL"))
    cooked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recipe_history")
    recipe = relationship("Recipe", back_populates="user_history")