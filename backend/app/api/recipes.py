from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    InventoryItem,
    Recipe,
    RecipeIngredient,
    User,
    UserRecipeHistory,
)
from app.schemas.recipe import (
    RecipeCreate,
    RecipeDetail,
    RecipeSchema,
    RecipeSuggestion,
    RecipeSuggestionRequest,
)
from app.utils.gemini import generate_recipes
from app.utils.security import get_current_user

router = APIRouter(tags=["recipes"], prefix="/recipes")


@router.get("/history", response_model=List[RecipeSchema])
async def get_recipe_history(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get current user's recipe history"""
    history = (
        db.query(Recipe)
        .join(UserRecipeHistory)
        .filter(UserRecipeHistory.user_id == current_user.user_id)
        .order_by(UserRecipeHistory.created_at.desc())
        .all()
    )

    return history


@router.get("/{recipe_id}", response_model=RecipeDetail)
async def get_recipe_detail(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get details of a specific recipe"""
    recipe = db.query(Recipe).filter(Recipe.recipe_id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found"
        )

    return recipe


@router.post("/suggest", response_model=List[RecipeSuggestion])
async def suggest_recipes(
    request: RecipeSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Suggest recipes based on user's inventory and preferences"""
    # Get user's inventory
    if not request.custom_ingredients:
        inventory_items = (
            db.query(InventoryItem)
            .filter(InventoryItem.user_id == current_user.user_id)
            .all()
        )

        ingredients = [item.name for item in inventory_items]
    else:
        ingredients = request.custom_ingredients

    # Get user's preferences
    if len(current_user.dietary_preferences) == 0:
        dietary_preference = "Non-vegetarian"  # Default
    else:
        dietary_preference = current_user.dietary_preferences[0].name

    if len(current_user.preferred_cuisines) == 0:
        cuisine_preference = "American"  # Default
    else:
        cuisine_preference = current_user.preferred_cuisines[0].name

    # Get previously made recipes
    previous_recipes = []
    if not request.ignore_history:
        history = (
            db.query(Recipe.title)
            .join(UserRecipeHistory)
            .filter(
                UserRecipeHistory.user_id == current_user.user_id,
                UserRecipeHistory.cooked == True,
            )
            .order_by(UserRecipeHistory.created_at.desc())
            .limit(2)
            .all()
        )

        previous_recipes = [recipe.title for recipe in history]

    # Generate recipe suggestions
    recipe_suggestions = generate_recipes(
        ingredients=ingredients,
        dietary_preference=dietary_preference,
        cuisine_preference=cuisine_preference,
        previous_recipes=previous_recipes,
    )

    # Check if suggestions were generated
    if recipe_suggestions["status"] == 400:
        return []

    # Format suggestions
    suggestions = []
    for recipe_data in recipe_suggestions["recipes"]:
        if recipe_data["status"] == 200:
            suggestions.append(
                RecipeSuggestion(
                    recipe_name=recipe_data["recipe_name"],
                    description=recipe_data["description"],
                    ingredients=recipe_data["ingredients"],
                    approx_time=recipe_data["approx_time"],
                    steps=recipe_data["steps"],
                )
            )

    return suggestions


@router.post("/create", response_model=RecipeDetail)
async def create_recipe(
    recipe_data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new recipe and add it to user's history"""
    # Create recipe
    new_recipe = Recipe(
        title=recipe_data.recipe_name,
        short_description=recipe_data.description,
        instructions="\n".join(recipe_data.steps),
        total_time_minutes=_parse_time_to_minutes(recipe_data.approx_time),
    )

    db.add(new_recipe)
    db.flush()  # Get the recipe_id without committing transaction

    # Add ingredients
    for ingredient_name in recipe_data.ingredients:
        ingredient = RecipeIngredient(
            recipe_id=new_recipe.recipe_id, ingredient_name=ingredient_name
        )
        db.add(ingredient)

    # Add to user history
    history_entry = UserRecipeHistory(
        user_id=current_user.user_id, recipe_id=new_recipe.recipe_id, cooked=False
    )

    db.add(history_entry)
    db.commit()
    db.refresh(new_recipe)

    return new_recipe


@router.post("/{recipe_id}/cook", response_model=dict)
async def cook_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a recipe as cooked and remove ingredients from inventory"""
    # Get the recipe
    recipe = db.query(Recipe).filter(Recipe.recipe_id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found"
        )

    # Get recipe history entry or create one
    history_entry = (
        db.query(UserRecipeHistory)
        .filter(
            UserRecipeHistory.user_id == current_user.user_id,
            UserRecipeHistory.recipe_id == recipe_id,
        )
        .first()
    )

    if not history_entry:
        history_entry = UserRecipeHistory(
            user_id=current_user.user_id, recipe_id=recipe_id, cooked=True
        )
        db.add(history_entry)
    else:
        history_entry.cooked = True

    # Remove ingredients from inventory
    ingredients_used = 0
    ingredient_names = [
        ingredient.ingredient_name.lower() for ingredient in recipe.ingredients
    ]

    for ingredient_name in ingredient_names:
        # Find matching inventory item
        inventory_item = (
            db.query(InventoryItem)
            .filter(
                InventoryItem.user_id == current_user.user_id,
                InventoryItem.name.ilike(ingredient_name),
            )
            .first()
        )

        if inventory_item:
            db.delete(inventory_item)
            ingredients_used += 1

    db.commit()

    return {
        "message": "Recipe cooked successfully",
        "ingredients_used": ingredients_used,
    }


def _parse_time_to_minutes(time_str: str) -> int:
    """Parse time string like '45 minutes' to minutes integer"""
    try:
        # Remove any text and convert to integer
        return int("".join(filter(str.isdigit, time_str)))
    except (ValueError, TypeError):
        # Default to 30 minutes if parsing fails
        return 30