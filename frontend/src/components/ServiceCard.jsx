import { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceGallery from '../components/ServiceGallery.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';
import RequestServiceModal from './RequestServiceModal.jsx';
import ServiceDetailsModal from './ServiceDetailsModal.jsx';
import EditServiceModal from './EditServiceModal.jsx';
import "./ServiceCard.css";
import { Link } from "react-router";

const ServiceCard = ({ service, isOwner = false, onDelete, onUpdate }) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${service.title}"?`);
    if (!confirmed) return;

    if (onDelete) {
      setDeleting(true);
      try {
        await onDelete(service.id);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <>
      <motion.article
        className="service-card modern"
      // drag
      // dragSnapToOrigin
      // dragTransition={{
      //   bounceStiffness: 300,
      //   bounceDamping: 20
      // }}
      >
        <div className="modern-image-wrapper">
          <ServiceGallery serviceId={service.id} />
        </div>

        <div className="service-card-content modern-content">
          <p className="service-category modern-category">
            {service.category_name}
          </p>

          <div className="modern-header-row">
            <h2 className="modern-title">{service.title}</h2>
            <div className="modern-price">
              {service.price ? `${service.price} ETB` : "Negotiable"}
            </div>
          </div>

          <p className="modern-section-label">DESCRIPTION</p>
          <p className="service-description modern-description">
            {service.description.length > 120
              ? `${service.description.substring(0, 120)}...`
              : service.description}
          </p>

          <p className="modern-section-label">PROVIDER</p>
          <div className="modern-provider-info">
            <Link to={`/users/${service.user_id}`} className="modern-provider-link" onClick={e => e.stopPropagation()}>
              <ProfileAvatar
                userId={service.user_id}
                name={service.provider_name}
                hasProfilePicture={service.provider_has_profile_picture}
                size="small"
              />
              <span className="modern-provider-name">{service.provider_name}</span>
            </Link>
            <span className="modern-location">
              <i className="fa-solid fa-location-dot"></i> {service.location}
            </span>
          </div>

          <div className="modern-actions">
            {isOwner ? (
              <>
                <button
                  type="button"
                  className="modern-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(e);
                  }}
                  disabled={deleting}
                  title="Delete Service"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
                <button
                  type="button"
                  className="modern-btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                >
                  EDIT SERVICE
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="modern-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailsModalOpen(true);
                  }}
                  title="View Details"
                >
                  <i className="fa-solid fa-circle-info"></i>
                </button>
                <button
                  type="button"
                  className="modern-btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRequestModalOpen(true);
                  }}
                >
                  REQUEST SERVICE
                </button>
              </>
            )}
          </div>
        </div>
      </motion.article>

      <ServiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        serviceId={service.id}
      />

      <EditServiceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        serviceId={service.id}
        onServiceUpdated={onUpdate}
      />

      <RequestServiceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        service={service}
      />
    </>
  );
};

export default ServiceCard;