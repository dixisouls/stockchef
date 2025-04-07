from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel


class DietaryPreferenceSchema(BaseModel):
    """Schema for dietary preference"""

    preference_id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


class CuisineSchema(BaseModel):
    """Schema for cuisine"""

    cuisine_id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base user schema"""

    email: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class UserProfile(UserBase):
    """User profile schema"""

    user_id: UUID
    created_at: datetime
    updated_at: datetime
    dietary_preferences: List[DietaryPreferenceSchema]
    preferred_cuisines: List[CuisineSchema]


class UserPreferenceUpdate(BaseModel):
    """Schema for updating user preferences"""

    dietary_preference_id: int
    cuisine_preference_id: int
