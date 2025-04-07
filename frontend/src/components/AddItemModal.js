import React, { useState, useEffect } from "react";
import { addInventoryItem } from "../services/api";
import { useNotification } from "./Notification";

const AddItemModal = ({ onClose, onItemAdded }) => {
  const [itemName, setItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Focus the input field when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("item-name");
      if (input) input.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemName.trim()) {
      showNotification("Please enter an item name", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      await addInventoryItem({ name: itemName.trim() });
      showNotification("Item added to inventory", "success");

      // Reset form
      setItemName("");

      // Refresh inventory in parent component
      if (onItemAdded) onItemAdded();

      // Close modal
      onClose();
    } catch (error) {
      showNotification("Failed to add item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add Inventory Item</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="item-name">
              Item Name
            </label>
            <input
              type="text"
              id="item-name"
              className="form-input"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Onion, Potato, Chicken"
              disabled={isSubmitting}
              autoComplete="off"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the name of a food item to add to your inventory
            </p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
