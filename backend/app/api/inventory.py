import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import InventoryItem, User
from app.schemas.inventory import InventoryItemSchema, InventoryItemCreate, InventoryUpdate
from app.utils.gemini import extract_items_from_image
from app.utils.security import get_current_user

router = APIRouter(tags=["inventory"], prefix="/inventory")

@router.get("/", response_model=List[InventoryItemSchema])
async def get_inventory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's inventory"""
    return db.query(InventoryItem).filter(InventoryItem.user_id == current_user.user_id).all()

@router.post("/item", response_model=InventoryItemSchema)
async def add_inventory_item(
    item: InventoryItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a single item to the inventory"""
    # Check if item already exists
    existing_item = db.query(InventoryItem).filter(
        InventoryItem.user_id == current_user.user_id,
        InventoryItem.name.ilike(item.name)  # Case-insensitive comparison
    ).first()
    
    if existing_item:
        return existing_item
    
    # Create new item
    new_item = InventoryItem(
        user_id=current_user.user_id,
        name=item.name
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@router.delete("/item/{item_id}", response_model=dict)
async def remove_inventory_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an item from the inventory"""
    # Find the item
    item = db.query(InventoryItem).filter(
        InventoryItem.item_id == item_id,
        InventoryItem.user_id == current_user.user_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Remove the item
    db.delete(item)
    db.commit()
    
    return {"message": "Item removed successfully"}

@router.post("/upload-image", response_model=dict)
async def upload_inventory_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update inventory from image using Gemini API"""
    # Check file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Check file size
    file_size = 0
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size ({settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB)"
        )
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Create a unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    file_path = f"{settings.UPLOAD_DIR}/{current_user.user_id}_{file.filename}"
    
    # Save the file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Extract items from image
    result = extract_items_from_image(contents)
    
    if result["status"] == "404":
        return {"message": "No food items detected in the image", "items_added": 0}
    
    # Add items to inventory
    items_added = 0
    for item_name in result["items"]:
        # Check if item already exists
        existing_item = db.query(InventoryItem).filter(
            InventoryItem.user_id == current_user.user_id,
            InventoryItem.name.ilike(item_name)  # Case-insensitive comparison
        ).first()
        
        if not existing_item:
            # Create new item
            new_item = InventoryItem(
                user_id=current_user.user_id,
                name=item_name
            )
            
            db.add(new_item)
            items_added += 1
    
    db.commit()
    
    return {
        "message": f"Inventory updated with {items_added} new items",
        "items_added": items_added,
        "total_items_detected": len(result["items"]),
        "detected_items": result["items"]
    }

@router.post("/update-multiple", response_model=dict)
async def update_inventory_items(
    inventory_update: InventoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update inventory with multiple items at once"""
    items_added = 0
    
    for item_name in inventory_update.items:
        # Check if item already exists
        existing_item = db.query(InventoryItem).filter(
            InventoryItem.user_id == current_user.user_id,
            InventoryItem.name.ilike(item_name)  # Case-insensitive comparison
        ).first()
        
        if not existing_item:
            # Create new item
            new_item = InventoryItem(
                user_id=current_user.user_id,
                name=item_name
            )
            
            db.add(new_item)
            items_added += 1
    
    db.commit()
    
    return {
        "message": f"Inventory updated with {items_added} new items",
        "items_added": items_added
    }