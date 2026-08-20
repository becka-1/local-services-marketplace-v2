import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useUser } from "../context/UserContext.jsx";
import { getProfile } from "../services/profileApi.js";
import { getUserServices } from "../services/userApi.js";
import { deleteService } from "../services/serviceApi.js";
import ProfileAvatar from "../components/ProfileAvatar.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import "./UserProfile.css";

const UserProfile = () => {
  const { id } = useParams();
  const { currentUserId, currentUser } = useUser();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  const isOwnProfile = Number(id) === Number(currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isOwnProfile || isAdmin;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, serviceData] = await Promise.all([
          getProfile(id),
          getUserServices(id),
        ]);

        setProfile(profileData);
        setServices(serviceData || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to load user profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteService(serviceId, profile.user_id);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  };

  const handleServiceUpdated = (updatedService) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? { ...s, ...updatedService } : s))
    );
  };

  const filteredServices = services.filter((s) => {
    if (!serviceSearch.trim()) return true;
    const query = serviceSearch.toLowerCase();
    return (
      s.title?.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      s.category_name?.toLowerCase().includes(query) ||
      s.location?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-error-container">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <h2>Profile Unavailable</h2>
          <p>{error || "We couldn't find the requested user profile."}</p>
          <Link to="/services" className="btn-back-services">
            ← Explore Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* Cover Banner Header */}
      <div className="profile-cover-banner">
        <div className="cover-ambient-shape cover-shape-1"></div>
        <div className="cover-ambient-shape cover-shape-2"></div>
        <div className="cover-top-bar">
          <Link to="/services" className="profile-breadcrumb-link">
            ← Back to Services
          </Link>
          <div className="profile-banner-tags">
            {isOwnProfile && (
              <span className="profile-tag tag-own">
                🌟 Your Account
              </span>
            )}
            {!isOwnProfile && isAdmin && (
              <span className="profile-tag tag-admin">
                🛡️ Viewing as Admin
              </span>
            )}
            {profile.role === 'admin' && (
              <span className="profile-tag tag-role-admin">
                ⚡ Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-main-container">
        {/* Profile Card Overlay */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <ProfileAvatar
              userId={profile.user_id}
              name={profile.name}
              hasProfilePicture={profile.has_profile_picture}
              size="large"
            />
            <div className="avatar-status-indicator" title="Active user"></div>
          </div>

          <div className="profile-identity-block">
            <div className="identity-title-row">
              <h1 className="profile-full-name">{profile.name}</h1>
            </div>

            <div className="identity-sub-details">
              {profile.location && (
                <span className="detail-item">
                  📍 {profile.location}
                </span>
              )}
              {profile.profile_created_at && (
                <span className="detail-item">
                  📅 Member since {formatDate(profile.profile_created_at)}
                </span>
              )}
              <span className="detail-item">
                💼 {services.length} {services.length === 1 ? "Service" : "Services"} Listed
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="profile-header-actions">
              <Link
                to={`/users/${profile.user_id}/edit`}
                className="btn-profile-action btn-edit-profile"
              >
                ✏️ Edit Profile
              </Link>
              {isOwnProfile && (
                <Link
                  to={`/users/${profile.user_id}/requests`}
                  className="btn-profile-action btn-my-requests"
                >
                  📋 My Requests
                </Link>
              )}
              <Link
                to="/services/new"
                className="btn-profile-action btn-add-service-primary"
              >
                ➕ Post Service
              </Link>
            </div>
          )}
        </div>

        {/* Two-Column Content Grid */}
        <div className="profile-content-grid">
          {/* Left Column: Bio, Contact, Socials */}
          <aside className="profile-sidebar">
            {/* Bio Card */}
            <div className="sidebar-card bio-card">
              <h3 className="sidebar-card-title">About</h3>
              {profile.bio ? (
                <p className="profile-bio-text">{profile.bio}</p>
              ) : (
                <p className="profile-bio-placeholder">
                  {isOwnProfile
                    ? "Add a short bio to introduce yourself and your services to potential clients."
                    : "This user hasn't written a bio yet."}
                </p>
              )}
              {isOwnProfile && !profile.bio && (
                <Link to={`/users/${profile.user_id}/edit`} className="link-inline-action">
                  + Add Bio
                </Link>
              )}
            </div>

            {/* Contact Details Card */}
            <div className="sidebar-card contact-card">
              <h3 className="sidebar-card-title">Contact Information</h3>
              <div className="contact-list">
                {profile.email && (
                  <div className="contact-row">
                    <span className="contact-icon">✉️</span>
                    <div className="contact-text">
                      <span className="contact-label">Email</span>
                      <a href={`mailto:${profile.email}`} className="contact-value link-highlight">
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile.phone && (
                  <div className="contact-row">
                    <span className="contact-icon">📞</span>
                    <div className="contact-text">
                      <span className="contact-label">Phone</span>
                      <a href={`tel:${profile.phone}`} className="contact-value link-highlight">
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {profile.location && (
                  <div className="contact-row">
                    <span className="contact-icon">📍</span>
                    <div className="contact-text">
                      <span className="contact-label">Location</span>
                      <span className="contact-value">{profile.location}</span>
                    </div>
                  </div>
                )}

                {profile.website && (
                  <div className="contact-row">
                    <span className="contact-icon">🌐</span>
                    <div className="contact-text">
                      <span className="contact-label">Website</span>
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="contact-value link-highlight"
                      >
                        {profile.website.replace(/^https?:\/\//i, "")}
                      </a>
                    </div>
                  </div>
                )}

                {!profile.email && !profile.phone && !profile.website && !profile.location && (
                  <p className="empty-info-note">No public contact info provided.</p>
                )}
              </div>
            </div>

            {/* Social Links Card */}
            {profile.social_links?.length > 0 && (
              <div className="sidebar-card socials-card">
                <h3 className="sidebar-card-title">Social Links</h3>
                <div className="social-badges-container">
                  {profile.social_links.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="social-pill-btn"
                    >
                      <span className="social-pill-icon">🔗</span>
                      <span className="social-pill-platform">{social.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Services List */}
          <main className="profile-main-body">
            <div className="services-section-wrapper">
              <div className="services-section-header">
                <div className="services-title-group">
                  <h2>
                    {isOwnProfile ? "My Services" : `Services by ${profile.name}`}
                  </h2>
                  <span className="services-count-badge">
                    {services.length}
                  </span>
                </div>

                {canEdit && (
                  <Link to="/services/new" className="btn-post-service-secondary">
                    + Post New Service
                  </Link>
                )}
              </div>

              {services.length > 0 && (
                <div className="services-filter-bar">
                  <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search within this provider's services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="service-search-input"
                    />
                    {serviceSearch && (
                      <button
                        type="button"
                        onClick={() => setServiceSearch("")}
                        className="clear-search-btn"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <div className="empty-services-state">
                  <div className="empty-icon-wrap">🛠️</div>
                  <h3>No services listed yet</h3>
                  <p>
                    {isOwnProfile
                      ? "You haven't published any services on the marketplace yet. Create one now to start receiving requests!"
                      : `${profile.name} hasn't listed any services on the marketplace yet.`}
                  </p>
                  {canEdit && (
                    <Link to="/services/new" className="btn-cta-primary">
                      + Create First Service
                    </Link>
                  )}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="empty-services-state no-search-matches">
                  <div className="empty-icon-wrap">🔎</div>
                  <h3>No matching services</h3>
                  <p>No services matched your search term "{serviceSearch}".</p>
                  <button
                    type="button"
                    onClick={() => setServiceSearch("")}
                    className="btn-reset-search"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div className="profile-services-grid">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isOwner={canEdit}
                      onDelete={handleDeleteService}
                      onUpdate={handleServiceUpdated}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;