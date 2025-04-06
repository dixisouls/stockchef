from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    """JWT token response schema"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token data schema (for internal use)"""
    email: str | None = None


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserRegistration(BaseModel):
    """User registration schema"""
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str
    dietary_preference_id: int
    cuisine_preference_id: int