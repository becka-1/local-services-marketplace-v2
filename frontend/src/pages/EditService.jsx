import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  getServiceById,
  getServiceImages,
  updateService,
  deleteServiceImage,
} from "../services/serviceApi.js";

import { getCategories } from "../services/categoryApi.js";

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [images, setImages] =
    useState([]);

  const [newImages, setNewImages] =
    useState([]);

  const [formData, setFormData] = useState({
    user_id: "",
    category_id: "",
    title: "",
    description: "",
    price: "",
    location: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          service,
          categoryData,
          imageData,
        ] = await Promise.all([
          getServiceById(id),
          getCategories(),
          getServiceImages(id),
        ]);

        setCategories(categoryData);

        setImages(imageData);

        setFormData({
          user_id: service.user_id,
          category_id: service.category_id,
          title: service.title,
          description: service.description,
          price: service.price ?? "",
          location: service.location ?? "",
        });
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load service."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    setNewImages(
      Array.from(event.target.files)
    );
  };

  const handleDeleteImage = async (
    imageId
  ) => {
    const confirmed = window.confirm(
      "Delete this image?"
    );

    if (!confirmed) return;

    try {
      await deleteServiceImage(
        id,
        imageId,
        formData.user_id
      );

      setImages((previous) =>
        previous.filter(
          (image) => image.id !== imageId
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete image."
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      data.append(
        "user_id",
        formData.user_id
      );

      data.append(
        "category_id",
        formData.category_id
      );

      data.append(
        "title",
        formData.title
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "location",
        formData.location
      );

      newImages.forEach((image) => {
        data.append("images", image);
      });

      await updateService(id, data);

      navigate(`/services/${id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update service."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Edit Service</h1>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            user_id
          </label>

          <input 
            type="number"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            Title
          </label>

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>
            Category
          </label>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">
              Select a category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>

        <div className="form-group">
          <label>
            Price
          </label>

          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>
            Location
          </label>

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <h2>Current Images</h2>

          <div className="edit-images">
            {images.map((image) => (
              <div
                key={image.id}
                className="edit-image"
              >
                <img
                  src={
                    `http://localhost:5000/api/services/` +
                    `${id}/images/${image.id}`
                  }
                  alt="Service"
                />

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteImage(
                      image.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>
            Add More Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </form>
    </main>
  );
};

export default EditService;