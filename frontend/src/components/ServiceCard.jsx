import { motion } from 'framer-motion';
import ServiceGallery from '../components/ServiceGallery.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';
import "./ServiceCard.css";
import { Link } from "react-router";

const ServiceCard = ({ service }) => {
  return (
    <motion.article 
      className="service-card"
      drag
      dragSnapToOrigin
      dragTransition={{
        bounceStiffness: 300,
        bounceDamping: 20
      }}
    >
        {/* <div className="service-card-image">
          <span>No image</span>
        </div> */}
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
            <Link 
              to={`/services/${service.id}`}
              className="details-button"
            >
              <button>View Service Details</button>
            </Link>
          </div>

          <Link 
            className="request-button"
          >
            <button>Request Service</button>
          </Link>
          
        </div>
    </motion.article>
  );
};

export default ServiceCard;