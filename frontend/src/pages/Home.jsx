import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { getFeaturedServices } from "../services/serviceApi.js";
import "./Home.css";
import ServiceDetailsModal from "../components/ServiceDetailsModal.jsx";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedServices();
        setFeatured(data);
      } catch (err) {
        console.error("Failed to load featured services", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            A marketplace but for <span className="text-gradient">services</span>
          </h1>
          <p className="hero-subtitle">
            Connect with skilled professionals in your community for any task, or offer your own expertise and start earning today.
          </p>

          <form className="hero-search-form" onSubmit={(e) => {
            e.preventDefault();
            const val = e.target.elements.search.value;
            if(val) navigate(`/services?search=${encodeURIComponent(val)}`);
            else navigate('/services');
          }}>
            <div className="hero-search-box">
              <input name="search" type="text" placeholder="What service do you need today?" className="hero-search-input" />
              <button type="submit" className="btn-search">Search</button>
            </div>
          </form>

          <div className="hero-actions-container">
            <div className="hand-drawn-callout">
              <span className="hand-drawn-text">get yourself a service</span>
              <svg className="hand-drawn-arrow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* A playful swooping arrow pointing down-right */}
                <path d="M10 20 C 40 0, 70 30, 90 70 M 90 70 L 70 70 M 90 70 L 85 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="hero-buttons">
              <button className="btn-primary-large" onClick={() => navigate('/services')}>
                Find a Service
              </button>
              <button className="btn-secondary-large" onClick={() => navigate('/services/new')}>
                Offer a Service
              </button>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon"><i className="fa-solid fa-magnifying-glass"></i></div>
            <h3>1. Browse</h3>
            <p>Explore a wide variety of services offered by verified local professionals.</p>
          </div>
          <div className="step-card">
            <div className="step-icon"><i className="fa-solid fa-handshake"></i></div>
            <h3>2. Connect</h3>
            <p>Reach out securely, negotiate terms, and finalize details directly.</p>
          </div>
          <div className="step-card">
            <div className="step-icon"><i className="fa-solid fa-star"></i></div>
            <h3>3. Get it Done</h3>
            <p>Enjoy quality service, leave a review, and strengthen your community.</p>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="featured-section">
        <div className="featured-header">
          <h2 className="section-title">Featured Services</h2>
          <Link to="/services" className="view-all-link">View All →</Link>
        </div>
        
        {featured.length > 0 ? (
          <div className="featured-grid">
            {featured.map(service => (
              <div 
                key={service.id} 
                className="featured-service-card"
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setIsDetailsModalOpen(true);
                }}
              >
                <div className="card-image">
                  {service.image_url ? (
                    <img src={`http://localhost:5000${service.image_url}`} alt={service.title} />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}
                  <div className="card-price-badge">{service.price ? `$${service.price}` : 'Negotiable'}</div>
                </div>
                <div className="card-content">
                  <span className="card-category">{service.category_name}</span>
                  <h3 className="card-title">{service.title}</h3>
                  <p className="card-provider">By {service.provider_name}</p>
                  <p className="card-location"><i className="fa-solid fa-location-dot"></i> {service.location}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-featured">Loading featured services...</p>
        )}
      </section>

      {/* Footer CTA */}
      <footer className="home-footer">
        <div className="footer-content">
          <h2>Ready to transform your local experience?</h2>
          <p>Join thousands of others in building a stronger, more connected community marketplace.</p>
          <button className="btn-primary-large" onClick={() => navigate('/services')}>
            Get Started Now
          </button>
        </div>
      </footer>

      {selectedServiceId && (
        <ServiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          serviceId={selectedServiceId}
        />
      )}
    </div>
  );
};

export default Home;
