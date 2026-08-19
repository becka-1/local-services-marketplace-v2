import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useUser } from "../context/UserContext.jsx";
import ProfileAvatar from "./ProfileAvatar.jsx";
import "./Navbar.css";

const Navbar = () => {
  const { currentUserId, setCurrentUserId, currentUserProfile } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuTimeoutRef = useRef(null);
  const menuContainerRef = useRef(null);

  const handleUserChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      setCurrentUserId(newId);
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

        {/* Right Corner Profile & User Switcher */}
        <div className="navbar-user-section">
          <div className="user-switcher-inline">
            <label htmlFor="userSelect">User:</label>
            <input
              id="userSelect"
              type="number"
              min="1"
              value={currentUserId}
              onChange={handleUserChange}
              title="Change active simulated user ID"
              className="user-id-input"
            />
          </div>

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
                name={currentUserProfile?.name || `User ${currentUserId}`}
                hasProfilePicture={currentUserProfile?.has_profile_picture}
                size="small"
              />
              <span className="user-name-display">
                {currentUserProfile?.name || `User ${currentUserId}`}
              </span>
              <span className={`dropdown-arrow ${showUserMenu ? "open" : ""}`}>▾</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown-wrapper">
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{currentUserProfile?.name || `User ${currentUserId}`}</strong>
                    <small>ID: #{currentUserId}</small>
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
