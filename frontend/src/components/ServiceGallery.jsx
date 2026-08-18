import { useEffect, useState } from 'react';
import './ServiceGallery.css';

import {
  getServiceImages,
} from '../services/serviceApi.js';

import ServiceImage from './ServiceImage.jsx';

const ServiceGallery = ({ serviceId }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data =
          await getServiceImages(serviceId);

        setImages(data);

        if (data.length > 0) {
          setSelectedImage(data[0]);
        }
      } catch (error) {
        console.error(
          "Failed to load service images:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [serviceId]);

  if (loading) {
    return <p>Loading images...</p>;
  }

  if (images.length === 0) {
    return (
      <div className="service-gallery-empty">
        No images available.
      </div>
    );
  }

  return (
    <div className="service-gallery">
      <div className="service-gallery-main">
        <ServiceImage
          serviceId={serviceId}
          imageId={selectedImage.id}
          alt="Service"
        />
      </div>

      <div className="service-gallery-thumbnails">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() =>
              setSelectedImage(image)
            }
            className={
              selectedImage.id === image.id
                ? "thumbnail active"
                : "thumbnail"
            }
          >
            <ServiceImage
              serviceId={serviceId}
              imageId={image.id}
              alt="Service thumbnail"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceGallery;