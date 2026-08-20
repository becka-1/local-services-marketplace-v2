import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { getServiceById } from "../services/serviceApi.js";
import ServiceGallery from "./ServiceGallery.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import RequestServiceModal from "./RequestServiceModal.jsx";
import "./ServiceDetailsModal.css";

const ServiceDetailsModal = ({ isOpen, onClose, serviceId }) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && serviceId) {
      const loadService = async () => {
        try {
          setLoading(true);
          setError("");
          const data = await getServiceById(serviceId);
          setService(data);
        } catch (err) {
          console.error(err);
          setError("Failed to load service details.");
        } finally {
          setLoading(false);
        }
      };
      loadService();
    } else {
      setService(null);
    }
  }, [isOpen, serviceId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isRequestModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isRequestModalOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="service-modal-backdrop" onClick={onClose}>
          <motion.div
            className="service-modal-container"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <button className="service-modal-close-btn" onClick={onClose} aria-label="Close modal">
              &times;
            </button>

            {loading && (
              <div className="service-modal-loading">
                <p>Loading service details...</p>
              </div>
            )}

            {error && (
              <div className="service-modal-error">
                <p>{error}</p>
                <button type="button" onClick={onClose}>Close</button>
              </div>
            )}

            {!loading && !error && service && (
              <div className="service-modal-content">
                <div className="service-modal-gallery-wrapper">
                  <ServiceGallery serviceId={service.id} />
                </div>

                <div className="service-modal-main-info">
                  <span className="service-modal-category">{service.category_name}</span>
                  <h1 className="service-modal-title">{service.title}</h1>

                  <div className="service-modal-meta">
                    <span className="service-modal-price">
                      <i className="fa-solid fa-money-bill-wave"></i> {service.price ? `${service.price} ETB` : "Price negotiable"}
                    </span>
                    {service.location && (
                      <span className="service-modal-location">
                        <i className="fa-solid fa-location-dot"></i> {service.location}
                      </span>
                    )}
                  </div>

                  <div className="service-modal-description">
                    <h3>Description</h3>
                    <p>{service.description}</p>
                  </div>

                  <div className="service-modal-provider-section">
                    <h3>Service Provider</h3>
                    <div className="service-modal-provider-card">
                      <ProfileAvatar
                        userId={service.provider_id || service.user_id}
                        name={service.provider_name}
                        hasProfilePicture={service.provider_has_profile_picture}
                        size="medium"
                      />
                      <div className="service-modal-provider-details">
                        <Link
                          to={`/users/${service.provider_id || service.user_id}`}
                          className="provider-profile-link"
                          onClick={onClose}
                        >
                          <strong>{service.provider_name}</strong> ↗
                        </Link>
                        {service.provider_bio && <p className="provider-bio">{service.provider_bio}</p>}
                        {service.provider_location && (
                          <p className="provider-loc"><i className="fa-solid fa-location-dot"></i> {service.provider_location}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="service-modal-actions">
                    <button
                      type="button"
                      className="modal-action-btn btn-request"
                      onClick={() => setIsRequestModalOpen(true)}
                    >
                      Request Service
                    </button>
                    <button
                      type="button"
                      className="modal-action-btn btn-close-secondary"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {service && (
        <RequestServiceModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          service={{
            id: service.id,
            title: service.title,
            provider_name: service.provider_name,
            user_id: service.provider_id || service.user_id,
          }}
        />
      )}
    </>
  );
};

export default ServiceDetailsModal;
