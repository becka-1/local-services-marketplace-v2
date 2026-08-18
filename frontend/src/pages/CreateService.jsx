import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { createService } from "../services/serviceApi.js";
import { getCategories } from "../services/categoryApi.js";

const CreateService = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    user_id: "",
    category_id: "",
    title: "",
    description: "",
    price: "",
    location: "",
  });

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        console.error(error);

        setError("Failed to load categories.");
      }
    };

    loadCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files
    );

    setImages(selectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      data.append("user_id", formData.user_id);
      data.append(
        "category_id",
        formData.category_id
      );
      data.append("title", formData.title);
      data.append(
        "description",
        formData.description
      );
      data.append("price", formData.price);
      data.append(
        "location",
        formData.location
      );

      images.forEach((image) => {
        data.append("images", image);
      });

      const result = await createService(data);

      navigate(
        `/services/${result.service.id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create service."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-service-page">
      <h1>Create a Service</h1>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user_id">
            User ID
          </label>

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
          <label htmlFor="title">
            Service title
          </label>

          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category_id">
            Category
          </label>

          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">
              Select a category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">
            Price
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">
            Location
          </label>

          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">
            Service images
          </label>

          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          {images.length > 0 && (
            <p>
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Service"}
        </button>
      </form>
    </main>
  );
};

export default CreateService;