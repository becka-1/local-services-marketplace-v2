import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useUser } from "../context/UserContext.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import LoginModal from "./LoginModal.jsx";
import SignupModal from "./SignupModal.jsx";
import { logout } from "../services/authApi.js";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, currentUser, currentUserId, currentUserProfile, handleLogoutSuccess } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
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
        <Link to="/services" className="navbar-brand">
          <span className="brand-icon">🛠️</span>
          <span className="brand-name">LocalServices</span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="navbar-nav">
          <Link to="/services" className="nav-link">
            Browse Services
          </Link>
          <Link to="/services/new" className="nav-link btn-post-service">
            + Post a Service
          </Link>
        </nav>

        {/* Right Corner Profile or Login */}
        <div className="navbar-user-section">
          {isAuthenticated ? (
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
                <span className={`dropdown-arrow ${showUserMenu ? "open" : ""}`}>▾</span>
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
                      👤 My Profile
                    </Link>
                    <Link
                      to={`/users/${currentUserId}/requests`}
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📋 My Requests
                    </Link>
                    <Link
                      to={`/users/${currentUserId}/edit`}
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      ✏️ Edit Profile
                    </Link>
                    {currentUser?.role === 'admin' && (
                      <Link
                        to={`/admin`}
                        className="dropdown-item"
                        style={{ color: '#007bff' }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        ⚙️ Admin Dashboard
                      </Link>
                    )}
                    <hr />
                    <button
                      type="button"
                      className="dropdown-item btn-logout"
                      onClick={handleLogout}
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-login-outline" onClick={() => setShowLoginModal(true)}>Log In</button>
              <button className="btn-signup-solid" onClick={() => setShowSignupModal(true)}>Sign Up</button>
            </div>
          )}
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
