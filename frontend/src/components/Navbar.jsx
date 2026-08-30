import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useUser } from "../context/UserContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import LoginModal from "./LoginModal.jsx";
import SignupModal from "./SignupModal.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import HamburgerToggle from "./HamburgerToggle.jsx";
import { logout } from "../services/authApi.js";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, currentUser, currentUserId, currentUserProfile, handleLogoutSuccess } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuTimeoutRef = useRef(null);
  const menuContainerRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      handleLogoutSuccess();
      setShowUserMenu(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setShowUserMenu(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="navbar-brand-section">
          <Link to="/" className="navbar-brand">
            <span className="brand-name">LocalServices</span>
          </Link>
          <div className="navbar-mobile-actions">
            {/* Mobile Theme Toggle */}
            <ThemeToggle className="navbar-theme-toggle mobile-only" />
            <HamburgerToggle 
              className="mobile-menu-toggle"
              isOpen={isMobileMenuOpen} 
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        </div>

        <div className={`navbar-links-wrapper ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Center Navigation Links */}
          <nav className="navbar-nav">
            <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/services" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Browse Services
            </Link>
            <Link to="/services/new" className="nav-link btn-post-service" onClick={() => setIsMobileMenuOpen(false)}>
              + Post a Service
            </Link>
          </nav>

          {/* Right Corner Profile or Login */}
          <div className="navbar-user-section">
            {/* Desktop Theme Toggle */}
            <ThemeToggle className="navbar-theme-toggle desktop-only" />

            {isAuthenticated ? (
              <div className="navbar-auth-group">
                <div
                  className="user-profile-menu-container"
                  ref={menuContainerRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className="navbar-profile-trigger"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    aria-expanded={showUserMenu}
                    title="User menu"
                  >
                    <ProfileAvatar
                      userId={currentUserId}
                      name={currentUserProfile?.name || currentUser?.email}
                      hasProfilePicture={currentUserProfile?.has_profile_picture}
                      size="small"
                    />
                    <span className="user-name-display">
                      {currentUserProfile?.name || "User"}
                    </span>
                    <span className={`dropdown-arrow ${showUserMenu ? "open" : ""}`}><i className="fa-solid fa-caret-down"></i></span>
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown-wrapper">
                      <div className="user-dropdown-menu">
                        <div className="dropdown-header">
                          <strong>{currentUserProfile?.name || currentUser?.email}</strong>
                        </div>
                        <hr />
                        <Link
                          to={`/users/${currentUserId}`}
                          className="dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <i className="fa-solid fa-user"></i> My Profile
                        </Link>
                        <Link
                          to="/messages"
                          className="dropdown-item"
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-regular fa-message"></i> Messages
                        </Link>
                        <Link
                          to={`/users/${currentUserId}/requests`}
                          className="dropdown-item"
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-clipboard-list"></i> My Requests
                        </Link>
                        {currentUser?.role === 'admin' && (
                          <Link
                            to={`/admin`}
                            className="dropdown-item"
                            style={{ color: '#007bff' }}
                            onClick={() => setShowUserMenu(false)}
                          >
                            <i className="fa-solid fa-gear"></i> Admin Dashboard
                          </Link>
                        )}
                        <hr />
                        <button
                          type="button"
                          className="dropdown-item btn-logout"
                          onClick={handleLogout}
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-login-outline" onClick={() => setShowLoginModal(true)}>Log In</button>
                <button className="btn-signup-solid" onClick={() => setShowSignupModal(true)}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </header>
  );
};

export default Navbar;
