from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RecipeIngredientSchema(BaseModel):
    """Schema for recipe ingredient"""

    recipe_id: int
    ingredient_name: str

    class Config:
        from_attributes = True


class RecipeBase(BaseModel):
    """Base schema for recipe"""

    title: str
    short_description: Optional[str] = None

    class Config:
        from_attributes = True


class RecipeSchema(RecipeBase):
    """Schema for recipe"""

    recipe_id: int
    total_time_minutes: Optional[int] = None
    created_at: datetime


class RecipeDetail(RecipeSchema):
    """Schema for recipe details"""

    instructions: str
    ingredients: List[RecipeIngredientSchema]


class RecipeSuggestion(BaseModel):
    """Schema for recipe suggestion from Gemini API"""

    recipe_name: str
    description: str
    ingredients: List[str]
    approx_time: str
    steps: List[str]


class RecipeCreate(BaseModel):
    """Schema for creating a recipe"""

    recipe_name: str
    description: str
    ingredients: List[str] = Field(..., min_items=1)
    approx_time: str
    steps: List[str] = Field(..., min_items=1)


class RecipeSuggestionRequest(BaseModel):
    """Schema for requesting recipe suggestions"""

    custom_ingredients: Optional[List[str]] = None
    ignore_history: bool = False
