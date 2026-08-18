import { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceGallery from '../components/ServiceGallery.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';
import RequestServiceModal from './RequestServiceModal.jsx';
import ServiceDetailsModal from './ServiceDetailsModal.jsx';
import "./ServiceCard.css";
import { Link } from "react-router";

const ServiceCard = ({ service }) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <>
      <motion.article 
        className="service-card"
        drag
        dragSnapToOrigin
        dragTransition={{
          bounceStiffness: 300,
          bounceDamping: 20
        }}
      >
          <ServiceGallery serviceId={service.id} />

          <div className="service-card-content">
            <p className="service-category">
              {service.category_name}
            </p>

            <h2>{service.title}</h2>

            <p className="service-description">
              {service.description}
            </p>

            <div className="service-info">
              <span>{service.location}</span>

              <span>
                {service.price
                  ? `${service.price} ETB`
                  : "Price negotiable"}
              </span>
            </div>

            <div className="link-container">
              <Link
                to={`/users/${service.user_id}`}
                className="service-provider"
              >
                <ProfileAvatar
                  userId={service.user_id}
                  name={service.provider_name}
                  hasProfilePicture={
                    service.provider_has_profile_picture
                  }
                  size="small"
                />

                <span>{service.provider_name}</span>
              </Link>
              <div className="details-button">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailsModalOpen(true);
                  }}
                >
                  View Service Details
                </button>
              </div>
            </div>

            <div className="request-button">
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRequestModalOpen(true);
                }}
              >
                Request Service
              </button>
            </div>
            
          </div>
      </motion.article>

      <ServiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        serviceId={service.id}
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