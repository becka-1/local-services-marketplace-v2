import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../context/UserContext.jsx";
import { createService } from "../services/serviceApi.js";
import { getCategories } from "../services/categoryApi.js";
import ImageCropperModal from "../components/ImageCropperModal.jsx";
import "./CreateService.css";

const CreateService = () => {
  const navigate = useNavigate();
  const { currentUserId } = useUser();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: currentUserId || "",
    category_id: "",
    title: "",
    description: "",
    price: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cropper state
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [filesToCrop, setFilesToCrop] = useState([]);
  const [recropIndex, setRecropIndex] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories.");
      }
    };

    loadCategories();
  }, []);

  // Synchronize object URL previews
  useEffect(() => {
    const previews = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const selectedFiles = Array.from(event.target.files);

    // Limit total images to 5
    const remainingSlots = 5 - images.length;
    const filesToProcess = selectedFiles.slice(0, remainingSlots);

    if (filesToProcess.length > 0) {
      setRecropIndex(null);
      setFilesToCrop(filesToProcess);
      setIsCropperOpen(true);
    }

    event.target.value = "";
  };

  const handleCropperComplete = (croppedFiles) => {
    if (recropIndex !== null && recropIndex >= 0) {
      // Replacing a single recropped image
      setImages((prev) => {
        const updated = [...prev];
        updated[recropIndex] = croppedFiles[0];
        return updated;
      });
    } else {
      // Adding new cropped files
      setImages((prev) => [...prev, ...croppedFiles]);
    }
    setIsCropperOpen(false);
    setFilesToCrop([]);
    setRecropIndex(null);
  };

  const handleRecropImage = (index) => {
    setRecropIndex(index);
    setFilesToCrop([images[index]]);
    setIsCropperOpen(true);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");

      const data = new FormData();
      data.append("user_id", formData.user_id);
      data.append("category_id", formData.category_id);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("location", formData.location);

      images.forEach((image) => {
        data.append("images", image);
      });

      await createService(data);
      navigate("/services");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-service-page">
      <h1>Create a Service</h1>

      {error && <p className="form-error">{error}</p>}

      <form onSubmit={handleSubmit} className="create-service-form">
        <div className="form-group">
          <label htmlFor="user_id">User ID</label>
          <input
            id="user_id"
            name="user_id"
            type="number"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Service Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Expert Home Electrical Repairs"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (ETB)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Leave empty for negotiable"
              value={formData.price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location / Area</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Bole, Addis Ababa"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Provide details about what you offer..."
            required
          />
        </div>

        {/* Service Images & Cropping */}
        <div className="form-group">
          <label>Service Images ({images.length}/5) — Consistent Size</label>

          {images.length < 5 && (
            <div className="file-input-wrapper">
              <label htmlFor="serviceImagesInput" className="file-input-label">
                <span className="upload-icon">📷</span>
                <strong>Click or Drag to Upload Images</strong>
                <small>Auto-crops to consistent marketplace card dimensions (16:9 / 4:3)</small>
              </label>
              <input
                id="serviceImagesInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="file-input-hidden"
              />
            </div>
          )}

          {images.length > 0 && (
            <div className="selected-images-grid">
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="image-preview-card">
                  <img src={url} alt={`Selected ${idx + 1}`} />
                  <div className="preview-overlay-actions">
                    <button
                      type="button"
                      className="preview-btn-crop"
                      onClick={() => handleRecropImage(idx)}
                      title="Adjust / Recrop"
                    >
                      ✂️ Crop
                    </button>
                    <button
                      type="button"
                      className="preview-btn-remove"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-submit-service"
          disabled={loading}
        >
          {loading ? "Creating Service..." : "Create Service"}
        </button>
      </form>

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
    </main>
  );
};

export default CreateService;