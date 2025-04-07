import React, { useState, useRef } from "react";
import { uploadInventoryImage } from "../services/api";
import { useNotification } from "./Notification";

const UploadImageModal = ({ onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Check file type
    if (!file.type.match("image.*")) {
      showNotification("Please select an image file", "warning");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification(
        "File too large. Please select an image under 10MB",
        "warning"
      );
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Validate file type
      if (!file.type.match("image.*")) {
        showNotification("Please drop an image file", "warning");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification("Please select an image first", "warning");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadInventoryImage(selectedFile);
      setUploadResult(result);

      if (result.items_added > 0) {
        showNotification(
          `Added ${result.items_added} new items to your inventory!`,
          "success"
        );
      } else {
        showNotification("No new items added to inventory", "info");
      }

      // Call the success callback
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      showNotification("Failed to process image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (uploadResult) {
      onClose();
    } else if (!isUploading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Update Inventory from Photo</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="upload-container">
          {!uploadResult ? (
            <>
              <div
                className="upload-dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="upload-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <h3>Click or drag an image here</h3>
                    <p className="upload-hint">
                      Take a photo of your fridge, pantry, or ingredients
                    </p>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />

              <div className="upload-actions">
                <button
                  className="button button-secondary"
                  onClick={handleClose}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  className="button button-primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-sm mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    "Process Image"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="upload-result">
              <div className="upload-result-icon">
                {uploadResult.items_added > 0 ? "✅" : "ℹ️"}
              </div>

              <h3 className="mb-4">
                {uploadResult.items_added > 0
                  ? `Added ${uploadResult.items_added} new items to your inventory!`
                  : "No new items added to inventory"}
              </h3>

              {uploadResult.detected_items &&
                uploadResult.detected_items.length > 0 && (
                  <div className="detected-items">
                    <h4 className="mb-2">Detected Items:</h4>
                    <ul className="detected-items-list">
                      {uploadResult.detected_items.map((item, index) => (
                        <li key={index} className="detected-item">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <button
                className="button button-primary mt-6"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
