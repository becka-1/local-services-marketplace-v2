import { API_URL } from "../services/api";

const ServiceImage = ({
  serviceId,
  imageId,
  alt = "Service image",
}) => {
  const imageUrl =
    `${API_URL}/services/` +
    `${serviceId}/images/${imageId}`;

  return (
    <img
      src={imageUrl}
      alt={alt}
    />
  );
};

export default ServiceImage;