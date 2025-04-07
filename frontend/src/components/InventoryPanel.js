import React from "react";
import { removeInventoryItem } from "../services/api";
import { useNotification } from "./Notification";

const InventoryPanel = ({
  inventory,
  onInventoryChange,
  onAddItem,
  onUploadImage,
  onRefresh,
  isRefreshing,
}) => {
  const { showNotification } = useNotification();

  const handleRemoveItem = async (itemId) => {
    try {
      await removeInventoryItem(itemId);

      // Update local state
      const updatedInventory = inventory.filter(
        (item) => item.item_id !== itemId
      );
      onInventoryChange(updatedInventory);

      showNotification("Item removed from inventory", "success");
    } catch (error) {
      showNotification("Failed to remove item", "error");
    }
  };

  return (
    <>
      <div className="panel-header">
        <h2>Your Inventory</h2>
        <div className="panel-actions">
          <button
            className="button button-primary"
            onClick={onAddItem}
            title="Add item manually"
          >
            <span className="button-icon">+</span>
            Add Item
          </button>
          <button
            className="button button-accent ml-2"
            onClick={onUploadImage}
            title="Update inventory from photo"
          >
            <span className="button-icon">📷</span>
            Scan Items
          </button>
          <button
            className="button button-ghost ml-2"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh inventory"
          >
            <span className="button-icon">{isRefreshing ? "⟳" : "⟳"}</span>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🥕</div>
          <h3 className="empty-state-title">Your inventory is empty</h3>
          <p className="empty-state-message">
            Add ingredients to get started with personalized recipes
          </p>
          <div className="empty-state-actions">
            <button className="button button-primary" onClick={onAddItem}>
              <span className="button-icon">+</span>
              Add Item Manually
            </button>
            <button className="button button-accent" onClick={onUploadImage}>
              <span className="button-icon">📷</span>
              Upload a Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="inventory-list">
          {inventory.map((item) => (
            <div key={item.item_id} className="inventory-item">
              <span className="inventory-item-name">{item.name}</span>
              <div className="inventory-actions">
                <button
                  className="action-button"
                  onClick={() => handleRemoveItem(item.item_id)}
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default InventoryPanel;
