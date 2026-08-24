import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getServiceById,
  getServiceImages,
  updateService,
  deleteServiceImage,
} from "../services/serviceApi.js";
import { getCategories } from "../services/categoryApi.js";
import ImageCropperModal from "./ImageCropperModal.jsx";
import "./EditServiceModal.css";

const EditServiceModal = ({ isOpen, onClose, serviceId, onServiceUpdated }) => {
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [selectedDefaultImages, setSelectedDefaultImages] = useState([]);
  const defaultImagesList = ["1292797.jpg", "679478.jpg", "712437.jpg"];

  // Cropper state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [filesToCrop, setFilesToCrop] = useState([]);
  const [recropIndex, setRecropIndex] = useState(null);

  const [formData, setFormData] = useState({
    user_id: "",
    category_id: "",
    title: "",
    description: "",
    price: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && serviceId) {
      const loadData = async () => {
        try {
          setLoading(true);
          setError("");
          setSuccess(false);
          setNewImages([]);
          setImagesToDelete([]);
          setSelectedDefaultImages([]);

          const [service, categoryData, imageData] = await Promise.all([
            getServiceById(serviceId),
            getCategories(),
            getServiceImages(serviceId),
          ]);

          setCategories(categoryData);
          setExistingImages(imageData);
          setFormData({
            user_id: service.provider_id || service.user_id,
            category_id: service.category_id,
            title: service.title,
            description: service.description,
            price: service.price ?? "",
            location: service.location ?? "",
          });
        } catch (err) {
          console.error(err);
          setError("Failed to load service details.");
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isOpen, serviceId]);

  // Generate previews for newly selected images
  useEffect(() => {
    if (newImages.length === 0) {
      setNewImagePreviews([]);
      return;
    }

    const objectUrls = newImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setNewImagePreviews(objectUrls);

    return () => {
      objectUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [newImages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const activeExistingCount = existingImages.length - imagesToDelete.length;
      const remainingSlots = 5 - (activeExistingCount + newImages.length + selectedDefaultImages.length);
      const filesToProcess = selectedFiles.slice(0, Math.max(1, remainingSlots));

      if (filesToProcess.length > 0) {
        setRecropIndex(null);
        setFilesToCrop(filesToProcess);
        setIsCropperOpen(true);
      }
      e.target.value = "";
    }
  };

  const handleCropperComplete = (croppedFiles) => {
    if (recropIndex !== null && recropIndex >= 0) {
      setNewImages((prev) => {
        const updated = [...prev];
        updated[recropIndex] = croppedFiles[0];
        return updated;
      });
    } else {
      setNewImages((prev) => [...prev, ...croppedFiles]);
    }
    setIsCropperOpen(false);
    setFilesToCrop([]);
    setRecropIndex(null);
  };

  const handleRecropNewImage = (idx) => {
    setRecropIndex(idx);
    setFilesToCrop([newImages[idx]]);
    setIsCropperOpen(true);
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleDeleteExistingImage = (imageId) => {
    setImagesToDelete((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleToggleDefaultImage = (filename) => {
    const existingImage = existingImages.find(img => img.default_filename === filename);
    
    if (existingImage) {
      if (imagesToDelete.includes(existingImage.id)) {
        setImagesToDelete(prev => prev.filter(id => id !== existingImage.id));
      } else {
        setImagesToDelete(prev => [...prev, existingImage.id]);
      }
    } else {
      setSelectedDefaultImages((prev) => {
        if (prev.includes(filename)) {
          return prev.filter((img) => img !== filename);
        } else {
          const activeExistingCount = existingImages.length - imagesToDelete.length;
          if (activeExistingCount + newImages.length + prev.length >= 5) {
            alert("You can only have up to 5 images in total.");
            return prev;
          }
          return [...prev, filename];
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activeExistingCount = existingImages.length - imagesToDelete.length;
      const totalImages = activeExistingCount + newImages.length + selectedDefaultImages.length;
      if (totalImages < 1 || totalImages > 5) {
        return setError("Please ensure your service has at least 1 and up to 5 images.");
      }

      setSaving(true);
      setError("");

      // Upload new data, new images, and deletions
      const data = new FormData();
      data.append("category_id", formData.category_id);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("location", formData.location);

      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(id => data.append("imagesToDelete", id));
      }

      newImages.forEach((img) => {
        data.append("images", img);
      });

      selectedDefaultImages.forEach((img) => {
        data.append("defaultImages", img);
      });

      const updated = await updateService(serviceId, data);

      if (onServiceUpdated) {
        onServiceUpdated(updated.service || { ...formData, id: serviceId });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update service.");
    } finally {
      setSaving(false);
    }
  };

  const activeExistingImages = existingImages.filter(
    (img) => !imagesToDelete.includes(img.id)
  );

  return (
    <AnimatePresence>
      <div key="edit-modal-backdrop" className="edit-modal-backdrop" onClick={onClose}>
        <motion.div
          className="edit-modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="edit-modal-header">
            <h2>Edit Service</h2>
            <button
              className="edit-modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>

          {loading && (
            <div className="edit-modal-loading">
              <p>Loading service data...</p>
            </div>
          )}

          {error && <div className="edit-modal-error">{error}</div>}
          {success && (
            <div className="edit-modal-success">Service updated successfully!</div>
          )}

          {!loading && (
            <form onSubmit={handleSubmit} className="edit-modal-form">
              <div className="form-group">
                <label htmlFor="serviceTitle">Service Title</label>
                <input
                  id="serviceTitle"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Professional Plumbing & Repairs"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="serviceCategory">Category</label>
                  <select
                    id="serviceCategory"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="servicePrice">Price (ETB)</label>
                  <input
                    id="servicePrice"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Leave empty for negotiable"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="serviceLocation">Location / Area</label>
                <input
                  id="serviceLocation"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bole, Addis Ababa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceDesc">Description</label>
                <textarea
                  id="serviceDesc"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your service, experience, and what's included..."
                />
              </div>

              {/* Current Existing Images */}
              {existingImages.length > 0 && (
                <div className="form-group">
                  <label>
                    Current Images ({activeExistingImages.length})
                    {imagesToDelete.length > 0 && (
                      <span className="deletion-count-badge">
                        {imagesToDelete.length} marked for removal
                      </span>
                    )}
                  </label>
                  <div className="edit-modal-images-grid">
                    {existingImages.map((img, idx) => {
                      const isMarked = imagesToDelete.includes(img.id);
                      return (
                        <div
                          key={img.id || `existing-${idx}`}
                          className={`edit-image-thumbnail ${
                            isMarked ? "marked-for-deletion" : ""
                          }`}
                        >
                          <img
                            src={`http://localhost:5000/api/services/${serviceId}/images/${img.id}`}
                            alt="Service"
                          />
                          {isMarked ? (
                            <div
                              className="deletion-overlay"
                              onClick={() =>
                                handleToggleDeleteExistingImage(img.id)
                              }
                            >
                              <span>Removed</span>
                              <small>Click to Undo</small>
                            </div>
                          ) : (
                            <div className="edit-thumb-actions">
                              <button
                                type="button"
                                className="delete-image-btn"
                                onClick={() =>
                                  handleToggleDeleteExistingImage(img.id)
                                }
                                title="Mark image for deletion"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected New Images Preview */}
              {newImagePreviews.length > 0 && (
                <div className="form-group">
                  <label className="new-images-label">
                    Newly Selected & Cropped Images ({newImagePreviews.length})
                  </label>
                  <div className="edit-modal-images-grid">
                    {newImagePreviews.map((item, idx) => (
                      <div
                        key={idx}
                        className="edit-image-thumbnail new-preview-thumbnail"
                      >
                        <img src={item.url} alt={`Preview ${idx + 1}`} />
                        <span className="new-tag">NEW</span>
                        <div className="edit-thumb-actions">
                          <button
                            type="button"
                            className="edit-thumb-btn-crop"
                            onClick={() => handleRecropNewImage(idx)}
                            title="Recrop this image"
                          >
                            ✂️
                          </button>
                          <button
                            type="button"
                            className="delete-image-btn"
                            onClick={() => handleRemoveNewImage(idx)}
                            title="Remove from upload"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Images Input */}
              <div className="form-group">
                <label htmlFor="serviceNewImages">
                  {newImages.length > 0 ? "Add More Images" : "Upload Images"}
                </label>
                <input
                  id="serviceNewImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input"
                />
                <small className="form-hint">
                  Uploaded images will open in the cropper to maintain uniform sizes.
                </small>
              </div>

              {/* Default Images Selector */}
              <div className="default-images-section">
                <p className="default-images-label">Or choose from our default gallery:</p>
                <div className="default-images-grid">
                  {defaultImagesList.map((filename) => {
                    const existingImage = existingImages.find(img => img.default_filename === filename);
                    const isExistingSelected = existingImage && !imagesToDelete.includes(existingImage.id);
                    const isNewSelected = selectedDefaultImages.includes(filename);
                    const isSelected = isExistingSelected || isNewSelected;

                    return (
                      <div 
                        key={filename} 
                        className={`default-image-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleDefaultImage(filename)}
                      >
                        <img src={`/default-service-images/${filename}`} alt="Default Service" />
                        {isSelected && (
                          <div className="default-image-checkmark">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving Changes..."
                    : imagesToDelete.length > 0
                    ? `Save Changes (${imagesToDelete.length} to delete)`
                    : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imagesToCrop={filesToCrop}
        onComplete={handleCropperComplete}
        onCancel={() => {
          setIsCropperOpen(false);
          setFilesToCrop([]);
          setRecropIndex(null);
        }}
      />
    </AnimatePresence>
  );
};

export default EditServiceModal;
