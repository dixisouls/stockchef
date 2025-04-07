from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Cuisine, DietaryPreference, User
from app.schemas.user import (
    DietaryPreferenceSchema,
    CuisineSchema,
    UserProfile,
    UserPreferenceUpdate,
)
from app.utils.security import get_current_user

router = APIRouter(tags=["users"], prefix="/users")


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.get("/preferences", response_model=dict)
async def get_preferences(db: Session = Depends(get_db)):
    """Get all available dietary preferences and cuisines"""
    dietary_prefs = db.query(DietaryPreference).all()
    cuisines = db.query(Cuisine).all()

    return {
        "dietary_preferences": [
            DietaryPreferenceSchema.model_validate(dp) for dp in dietary_prefs
        ],
        "cuisines": [CuisineSchema.model_validate(c) for c in cuisines],
    }


@router.put("/preferences", response_model=UserProfile)
async def update_preferences(
    preferences: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user preferences"""
    # Check if dietary preference exists
    dietary_pref = (
        db.query(DietaryPreference)
        .filter(DietaryPreference.preference_id == preferences.dietary_preference_id)
        .first()
    )
    if not dietary_pref:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid dietary preference"
        )

    # Check if cuisine preference exists
    cuisine_pref = (
        db.query(Cuisine)
        .filter(Cuisine.cuisine_id == preferences.cuisine_preference_id)
        .first()
    )
    if not cuisine_pref:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cuisine preference"
        )

    # Clear existing preferences
    current_user.dietary_preferences = []
    current_user.preferred_cuisines = []

    # Add new preferences
    current_user.dietary_preferences.append(dietary_pref)
    current_user.preferred_cuisines.append(cuisine_pref)

    # Save to database
    db.commit()
    db.refresh(current_user)

    return current_user
