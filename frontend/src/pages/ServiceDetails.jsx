import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { getServiceById } from "../services/serviceApi.js";
import ServiceGallery from '../components/ServiceGallery.jsx';
import RequestServiceModal from '../components/RequestServiceModal.jsx';
import {
  deleteService,
} from "../services/serviceApi.js";
import './ServiceDetails.css'

const ServiceDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getServiceById(id);

        setService(data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 404) {
          setError("Service not found.");
        } else {
          setError("Failed to load service.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  if (loading) {
    return <p>Loading service...</p>;
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>

        <Link to="/services">
          Back to services
        </Link>
      </main>
    );
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      await deleteService(
        service.id,
        service.user_id
      );

      navigate("/services");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <Link to="/services">
        ← Back to services
      </Link>

      <section className="service-details">
        {/* <div className="service-details-image">
          <span>No image</span>
        </div> */}
        <ServiceGallery serviceId={service.id} />

        <div className="service-details-content">
          <p className="service-category">
            {service.category_name}
          </p>

          <h1>{service.title}</h1>

          <p className="service-details-description">
            {service.description}
          </p>

          <div className="service-details-info">
            <p>
              <strong>Price:</strong>{" "}
              {service.price
                ? `${service.price} ETB`
                : "Price negotiable"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {service.location || "Not specified"}
            </p>
          </div>
        </div>
      </section>

      <section className="provider-section">
        <h2>Service Provider</h2>

        <div className="provider-profile">
          <div className="provider-large-avatar">
            {service.provider_name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h3>{service.provider_name}</h3>

            {service.provider_bio && (
              <p>{service.provider_bio}</p>
            )}

            {service.provider_location && (
              <p>
                Location: {service.provider_location}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="service-actions">
        <button type="button" onClick={() => setIsRequestModalOpen(true)}>
          Request Service
        </button>
        <Link to={`/services/${service.id}/edit`}>
          <button>
            Edit Service
          </button>  
        </Link>
        <button onClick={handleDelete}>
          Delete Service
        </button>
        
      </section>

      <RequestServiceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        service={{
          ...service,
          provider_name: service.provider_name,
        }}
      />
    </main>
  );
};

export default ServiceDetails;