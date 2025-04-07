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
    <div className="card">
      <div className="panel-header">
        <h2 className="panel-title">Your Inventory</h2>
        <div className="panel-actions">
          <button
            className="button"
            onClick={onAddItem}
            title="Add item manually"
          >
            + Add Item
          </button>
          <button
            className="button button-accent"
            onClick={onUploadImage}
            title="Update inventory from photo"
            style={{ marginLeft: "10px" }}
          >
            📷 Scan Items
          </button>
          <button
            className="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh inventory"
            style={{ marginLeft: "10px" }}
          >
            {isRefreshing ? "⟳ Refreshing..." : "⟳"}
          </button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-state">
          <p>Your inventory is empty. Add ingredients to get started!</p>
          <div className="empty-state-actions">
            <button className="button" onClick={onAddItem}>
              Add Item Manually
            </button>
            <button
              className="button button-accent"
              onClick={onUploadImage}
              style={{ marginLeft: "10px" }}
            >
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
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
