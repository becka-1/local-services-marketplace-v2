import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useUser } from "../context/UserContext.jsx";
import { getProfile, updateProfile, deleteProfilePicture, addSocialLink, deleteSocialLink } from "../services/profileApi.js";
import { getUserServices } from "../services/userApi.js";
import { deleteService } from "../services/serviceApi.js";
import { API_URL } from "../services/api.js";
import ProfileAvatar from "../components/ProfileAvatar.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import "./UserProfile.css";

const InlineEdit = ({ value, label, name, type = "text", isEditing, onChange, multiline = false, placeholder }) => {
  const [currentValue, setCurrentValue] = useState(value || "");
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value || "");
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (currentValue !== (value || "")) {
      onChange(name, currentValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setEditing(false);
      setCurrentValue(value || "");
    }
  };

  if (!isEditing) {
    return (
      <div className="inline-display">
        {label && <span className="contact-label">{label}</span>}
        {value ? (
          type === "url" ? (
            <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noreferrer" className="contact-value link-highlight">{value.replace(/^https?:\/\//i, "")}</a>
          ) : type === "email" ? (
            <a href={`mailto:${value}`} className="contact-value link-highlight">{value}</a>
          ) : type === "tel" ? (
            <a href={`tel:${value}`} className="contact-value link-highlight">{value}</a>
          ) : (
             <span className="contact-value" style={{ whiteSpace: multiline ? 'pre-line' : 'normal' }}>{value}</span>
          )
        ) : (
          <span className="empty-info-note">No {label ? label.toLowerCase() : 'info'} provided.</span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-edit-container">
      {label && <span className="contact-label">{label}</span>}
      {!editing ? (
        <div 
          className="inline-editable-text" 
          onClick={() => setEditing(true)}
          title="Click to edit"
        >
          {value ? (
            <span className="contact-value" style={{ whiteSpace: multiline ? 'pre-line' : 'normal' }}>{value}</span>
          ) : (
            <span className="inline-placeholder">{placeholder || `Add ${label ? label.toLowerCase() : 'value'}...`}</span>
          )}
          <span className="edit-icon"><i className="fa-solid fa-pen"></i></span>
        </div>
      ) : (
        multiline ? (
          <textarea
            ref={inputRef}
            className="inline-input multiline"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Enter ${label ? label.toLowerCase() : 'value'}...`}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            className="inline-input"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Enter ${label ? label.toLowerCase() : 'value'}...`}
          />
        )
      )}
    </div>
  );
};

const UserProfile = () => {
  const { id } = useParams();
  const { currentUserId, currentUser } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  
  // Pending changes state
  const [pendingChanges, setPendingChanges] = useState({});
  const [pendingPictureFile, setPendingPictureFile] = useState(null);
  const [pendingPicturePreview, setPendingPicturePreview] = useState(null);
  const [pendingPictureRemove, setPendingPictureRemove] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Social link state
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialUrl, setSocialUrl] = useState("");

  const isOwnProfile = Number(id) === Number(currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isOwnProfile || isAdmin;

  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0 || pendingPictureFile !== null || pendingPictureRemove;

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

  useEffect(() => {
    return () => {
      if (pendingPicturePreview) {
        URL.revokeObjectURL(pendingPicturePreview);
      }
    };
  }, [pendingPicturePreview]);

  const handleFieldChange = (field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Profile picture must be smaller than 5 MB.");
      return;
    }

    setPendingPictureFile(file);
    setPendingPicturePreview(URL.createObjectURL(file));
    setPendingPictureRemove(false);
  };

  const handleRemovePicture = () => {
    setPendingPictureFile(null);
    if (pendingPicturePreview) {
      URL.revokeObjectURL(pendingPicturePreview);
      setPendingPicturePreview(null);
    }
    setPendingPictureRemove(true);
  };

  const handleCancelChanges = () => {
    setPendingChanges({});
    setPendingPictureFile(null);
    if (pendingPicturePreview) {
      URL.revokeObjectURL(pendingPicturePreview);
      setPendingPicturePreview(null);
    }
    setPendingPictureRemove(false);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // If picture needs removing, do that first
      if (pendingPictureRemove && profile.has_profile_picture) {
        await deleteProfilePicture(id);
      }
      
      // Update text fields and optionally picture upload
      if (Object.keys(pendingChanges).length > 0 || pendingPictureFile) {
        const formData = new FormData();
        
        // Add all updated fields
        Object.entries(pendingChanges).forEach(([k, v]) => {
          formData.append(k, v);
        });

        // Ensure name and phone are always included as backend requires them
        if (!formData.has('name')) formData.append('name', profile.name || '');
        if (!formData.has('phone')) formData.append('phone', profile.phone || '');
        
        // Add other existing optional fields to preserve them, if not already in pendingChanges
        const optionalFields = ['bio', 'email', 'location', 'website'];
        optionalFields.forEach(f => {
          if (!formData.has(f) && profile[f]) formData.append(f, profile[f]);
        });

        if (pendingPictureFile) {
          formData.append("profile_picture", pendingPictureFile);
        }

        await updateProfile(id, formData);
      }

      // Reload profile
      const updatedProfile = await getProfile(id);
      setProfile(updatedProfile);
      
      // Reset state
      setPendingChanges({});
      setPendingPictureFile(null);
      setPendingPicturePreview(null);
      setPendingPictureRemove(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    if (!socialPlatform || !socialUrl) return;

    try {
      const data = await addSocialLink(id, { platform: socialPlatform, url: socialUrl });
      setProfile(prev => ({
        ...prev,
        social_links: [...(prev.social_links || []), data.social_link],
      }));
      setSocialPlatform("");
      setSocialUrl("");
      setShowSocialForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add social link.");
    }
  };

  const handleDeleteSocialLink = async (socialId) => {
    try {
      await deleteSocialLink(id, socialId);
      setProfile(prev => ({
        ...prev,
        social_links: prev.social_links.filter(s => s.id !== socialId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete social link.");
    }
  };

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
          <span className="error-icon"><i className="fa-solid fa-triangle-exclamation"></i></span>
          <h2>Profile Unavailable</h2>
          <p>{error || "We couldn't find the requested user profile."}</p>
          <Link to="/services" className="btn-back-services">
            ← Explore Services
          </Link>
        </div>
      </div>
    );
  }

  const currentDisplayValues = {
    ...profile,
    ...pendingChanges
  };

  const showPicture = pendingPicturePreview ? true : (profile.has_profile_picture && !pendingPictureRemove);

  return (
    <div className="profile-page-wrapper">
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
                <i className="fa-solid fa-star"></i> Your Account
              </span>
            )}
            {!isOwnProfile && isAdmin && (
              <span className="profile-tag tag-admin">
                <i className="fa-solid fa-shield-halved"></i> Viewing as Admin
              </span>
            )}
            {profile.role === 'admin' && (
              <span className="profile-tag tag-role-admin">
                <i className="fa-solid fa-bolt"></i> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="unsaved-changes-banner">
          <span>You have unsaved profile changes</span>
          <div className="unsaved-actions">
            <button onClick={handleCancelChanges} className="btn-cancel-changes" disabled={isSaving}>Cancel</button>
            <button onClick={handleSaveChanges} className="btn-save-changes" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      <div className="profile-main-container">
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            {showPicture ? (
              <div className="profile-avatar profile-avatar-large">
                <img src={pendingPicturePreview || `${API_URL}/profiles/${profile.user_id}/profile-picture?t=${Date.now()}`} alt="Profile" />
              </div>
            ) : (
              <ProfileAvatar
                userId={profile.user_id}
                name={currentDisplayValues.name}
                hasProfilePicture={false}
                size="large"
              />
            )}
            <div className="avatar-status-indicator" title="Active user"></div>
            
            {canEdit && (
              <div className="avatar-edit-overlay">
                <label htmlFor="profile-picture-upload" className="avatar-edit-btn" title="Change picture">
                  <i className="fa-solid fa-camera"></i>
                </label>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePictureChange}
                />
                {showPicture && (
                  <button type="button" className="avatar-remove-btn" onClick={handleRemovePicture} title="Remove picture">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="profile-identity-block">
            <div className="identity-title-row">
              {canEdit ? (
                <InlineEdit 
                  value={currentDisplayValues.name} 
                  name="name"
                  isEditing={true}
                  onChange={handleFieldChange} 
                  label=""
                  placeholder="Enter full name..."
                />
              ) : (
                <h1 className="profile-full-name">{profile.name}</h1>
              )}
            </div>

            <div className="identity-sub-details">
              <span className="detail-item">
                <i className="fa-regular fa-calendar"></i> Member since {formatDate(profile.profile_created_at)}
              </span>
              <span className="detail-item">
                <i className="fa-solid fa-briefcase"></i> {services.length} {services.length === 1 ? "Service" : "Services"} Listed
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="profile-header-actions">
              {isOwnProfile && (
                <Link
                  to={`/users/${profile.user_id}/requests`}
                  className="btn-profile-action btn-my-requests"
                >
                  <i className="fa-solid fa-clipboard-list"></i> My Requests
                </Link>
              )}
              <Link
                to="/services/new"
                className="btn-profile-action btn-add-service-primary"
              >
                <i className="fa-solid fa-plus"></i> Post Service
              </Link>
            </div>
          )}
        </div>

        <div className="profile-content-grid">
          <aside className="profile-sidebar">
            <div className="sidebar-card bio-card">
              <h3 className="sidebar-card-title">About</h3>
              {canEdit || currentDisplayValues.bio ? (
                <InlineEdit
                  value={currentDisplayValues.bio}
                  label=""
                  name="bio"
                  isEditing={canEdit}
                  multiline={true}
                  onChange={handleFieldChange}
                  placeholder="Tell people about yourself and your skills..."
                />
              ) : (
                <p className="empty-info-note">No bio provided.</p>
              )}
            </div>

            <div className="sidebar-card contact-card">
              <h3 className="sidebar-card-title">Contact Information</h3>
              <div className="contact-list">
                
                {(canEdit || currentDisplayValues.email) && (
                  <div className="contact-row">
                    <span className="contact-icon"><i className="fa-solid fa-envelope"></i></span>
                    <div className="contact-text">
                      <InlineEdit 
                        value={currentDisplayValues.email} 
                        name="email"
                        label="Email"
                        type="email" 
                        isEditing={canEdit} 
                        onChange={handleFieldChange} 
                      />
                    </div>
                  </div>
                )}

                {(canEdit || currentDisplayValues.phone) && (
                  <div className="contact-row">
                    <span className="contact-icon"><i className="fa-solid fa-phone"></i></span>
                    <div className="contact-text">
                      <InlineEdit 
                        value={currentDisplayValues.phone} 
                        name="phone"
                        label="Phone"
                        type="tel" 
                        isEditing={canEdit} 
                        onChange={handleFieldChange} 
                      />
                    </div>
                  </div>
                )}

                {(canEdit || currentDisplayValues.location) && (
                  <div className="contact-row">
                    <span className="contact-icon"><i className="fa-solid fa-location-dot"></i></span>
                    <div className="contact-text">
                       <InlineEdit 
                        value={currentDisplayValues.location} 
                        name="location"
                        label="Location"
                        isEditing={canEdit} 
                        onChange={handleFieldChange} 
                      />
                    </div>
                  </div>
                )}

                {(canEdit || currentDisplayValues.website) && (
                  <div className="contact-row">
                    <span className="contact-icon"><i className="fa-solid fa-globe"></i></span>
                    <div className="contact-text">
                       <InlineEdit 
                        value={currentDisplayValues.website} 
                        name="website"
                        label="Website"
                        type="url" 
                        isEditing={canEdit} 
                        onChange={handleFieldChange} 
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}

                {!canEdit && !currentDisplayValues.email && !currentDisplayValues.phone && !currentDisplayValues.website && !currentDisplayValues.location && (
                  <p className="empty-info-note">No public contact info provided.</p>
                )}
              </div>
            </div>

            {/* Social Links Card */}
            {(canEdit || profile.social_links?.length > 0) && (
              <div className="sidebar-card socials-card">
                <h3 className="sidebar-card-title">Social Links</h3>
                <div className="social-badges-container">
                  {profile.social_links?.map((social) => (
                    <div key={social.id} className="social-pill-wrapper">
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="social-pill-btn"
                      >
                        <span className="social-pill-icon"><i className="fa-solid fa-link"></i></span>
                        <span className="social-pill-platform">{social.platform}</span>
                      </a>
                      {canEdit && (
                        <button 
                          className="social-remove-btn" 
                          onClick={() => handleDeleteSocialLink(social.id)}
                          title="Remove link"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {canEdit && !showSocialForm && (
                    <button className="add-social-btn" onClick={() => setShowSocialForm(true)}>
                      + Add Link
                    </button>
                  )}
                </div>

                {showSocialForm && (
                  <form onSubmit={handleAddSocialLink} className="inline-social-form">
                    <select 
                      value={socialPlatform} 
                      onChange={e => setSocialPlatform(e.target.value)}
                      required
                    >
                      <option value="">Select Platform...</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="x">X / Twitter</option>
                      <option value="youtube">YouTube</option>
                      <option value="portfolio">Portfolio / Website</option>
                    </select>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      value={socialUrl} 
                      onChange={e => setSocialUrl(e.target.value)} 
                      required
                    />
                    <div className="social-form-actions">
                      <button type="button" onClick={() => setShowSocialForm(false)} className="btn-cancel-social">Cancel</button>
                      <button type="submit" className="btn-save-social">Add</button>
                    </div>
                  </form>
                )}
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
                    <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
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
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <div className="empty-services-state">
                  <div className="empty-icon-wrap"><i className="fa-solid fa-screwdriver-wrench"></i></div>
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
                  <div className="empty-icon-wrap"><i className="fa-solid fa-magnifying-glass"></i></div>
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