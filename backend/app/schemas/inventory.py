from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class InventoryItemBase(BaseModel):
    """Base schema for inventory item"""
    name: str = Field(..., min_length=2, max_length=100)
    
    class Config:
        from_attributes = True


class InventoryItemCreate(InventoryItemBase):
    """Schema for creating inventory item"""
    pass


class InventoryItemSchema(InventoryItemBase):
    """Schema for inventory item"""
    item_id: int
    user_id: UUID
    added_at: datetime
    updated_at: datetime


class InventoryUpdate(BaseModel):
    """Schema for updating multiple inventory items at once"""
    items: List[str] = Field(..., min_items=1)