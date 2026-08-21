import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getServices } from '../services/serviceApi.js';
import { getCategories } from '../services/categoryApi.js';
import ServiceCard from '../components/ServiceCard.jsx';
import './Services.css';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);

  const loadServices = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");

      const data = await getServices(filters);

      setServices(data);
    } catch (error) {
      console.error(error);

      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const s = searchParams.get("search") || "";
    const c = searchParams.get("category") || "";
    const l = searchParams.get("location") || "";

    setSearch(s);
    setCategory(c);
    setLocation(l);

    loadServices({
      search: s,
      category: c,
      location: l,
    });
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (location.trim()) params.location = location.trim();

    setSearchParams(params);
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load marketplace data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadCategories()
    }

    init();
  }, [])

  return (
    <main>
      <h1>Browse Services</h1>

      <form
        onSubmit={handleSearch}
        className="search-form"
      >
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          <option value="">All categories</option>
          
          {categories.map(category => {
            return (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          })}
        </select>

        <input
          type="text"
          placeholder="Location..."
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
        />

        <button type="submit">
          Search
        </button>
      </form>

      {loading && <p>Loading services...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        services.length === 0 ? (
          <p>No services found. Try another search.</p>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
              />
            ))}
          </div>
        )
      )}
    </main>
  );
};

export default Services;