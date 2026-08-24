import { Link } from 'react-router';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand & Description */}
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand">
              LocalServices
            </Link>
            <p className="footer-description">
              Connect with skilled professionals in your community for any task, or offer your own expertise and start earning today.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Quick Links</h4>
            <nav className="footer-nav">
              <Link to="/services" className="footer-link">Browse Services</Link>
              <Link to="/services/new" className="footer-link">Offer a Service</Link>
              <Link to="#" className="footer-link">How it Works</Link>
              <Link to="#" className="footer-link">Help & Support</Link>
            </nav>
          </div>

          {/* Newsletter Subscribe */}
          <div className="footer-subscribe-section">
            <h4 className="footer-heading">Subscribe to Newsletter</h4>
            <p className="subscribe-text">Get the latest updates, offers and stories delivered to your inbox.</p>
            <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
              <div className="subscribe-input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  className="subscribe-input"
                />
                <button type="submit" className="subscribe-button">Subscribe</button>
              </div>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} LocalServices. All rights reserved.
          </div>
          <div className="footer-legal">
            <Link to="#" className="legal-link">Privacy Policy</Link>
            <span className="legal-separator">•</span>
            <Link to="#" className="legal-link">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
