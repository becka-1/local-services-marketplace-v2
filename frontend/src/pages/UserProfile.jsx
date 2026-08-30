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

/* ─────────────── helpers ─────────────── */
const getSocialIcon = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'github':    return <i className="fa-brands fa-github"></i>;
    case 'linkedin':  return <i className="fa-brands fa-linkedin"></i>;
    case 'instagram': return <i className="fa-brands fa-instagram"></i>;
    case 'facebook':  return <i className="fa-brands fa-facebook"></i>;
    case 'x':
    case 'twitter':   return <i className="fa-brands fa-x-twitter"></i>;
    case 'youtube':   return <i className="fa-brands fa-youtube"></i>;
    case 'portfolio': return <i className="fa-solid fa-globe"></i>;
    default:          return <i className="fa-solid fa-link"></i>;
  }
};

/* ─────────────── main component ─────────────── */
const UserProfile = () => {
  const { id } = useParams();
  const { currentUserId, currentUser } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile]             = useState(null);
  const [services, setServices]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  /* edit mode ─ all changes are buffered until Save */
  const [isEditing, setIsEditing]                   = useState(false);
  const [pendingChanges, setPendingChanges]          = useState({});
  const [pendingPictureFile, setPendingPictureFile]  = useState(null);
  const [pendingPicturePreview, setPendingPicturePreview] = useState(null);
  const [pendingPictureRemove, setPendingPictureRemove]   = useState(false);
  const [isSaving, setIsSaving]                     = useState(false);
  const [saveError, setSaveError]                   = useState("");

  /* email visibility toggle (stored only locally until saved) */
  const [emailVisible, setEmailVisible] = useState(false);

  /* social links */
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialUrl, setSocialUrl]           = useState("");

  const isOwnProfile = Number(id) === Number(currentUserId);
  const isAdmin      = currentUser?.role === 'admin';
  const canEdit      = isOwnProfile || isAdmin;

  /* ─── load ─── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [profileData, serviceData] = await Promise.all([
          getProfile(id),
          getUserServices(id),
        ]);
        setProfile(profileData);
        setServices(serviceData || []);
        setEmailVisible(!!profileData.email_visible);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  /* cleanup object URLs */
  useEffect(() => {
    return () => { if (pendingPicturePreview) URL.revokeObjectURL(pendingPicturePreview); };
  }, [pendingPicturePreview]);

  /* ─── field change (text) ─── */
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setPendingChanges(prev => ({ ...prev, [name]: value }));
  };

  /* ─── picture ─── */
  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { alert("Profile picture must be smaller than 5 MB."); return; }
    setPendingPictureFile(file);
    setPendingPicturePreview(URL.createObjectURL(file));
    setPendingPictureRemove(false);
  };

  const handleRemovePicture = () => {
    setPendingPictureFile(null);
    if (pendingPicturePreview) { URL.revokeObjectURL(pendingPicturePreview); setPendingPicturePreview(null); }
    setPendingPictureRemove(true);
  };

  /* ─── cancel edit ─── */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingChanges({});
    setPendingPictureFile(null);
    if (pendingPicturePreview) { URL.revokeObjectURL(pendingPicturePreview); setPendingPicturePreview(null); }
    setPendingPictureRemove(false);
    setSaveError("");
    setEmailVisible(!!profile?.email_visible);
    setShowSocialForm(false);
  };

  /* ─── save ─── */
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setSaveError("");

      if (pendingPictureRemove && profile.has_profile_picture) {
        await deleteProfilePicture(id);
      }

      const formData = new FormData();
      // always include required fields
      formData.append('name',  pendingChanges.name  ?? profile.name  ?? '');
      formData.append('phone', pendingChanges.phone ?? profile.phone ?? '');
      // optional fields
      ['bio', 'location', 'website'].forEach(f => {
        formData.append(f, pendingChanges[f] ?? profile[f] ?? '');
      });
      // email visibility
      formData.append('email_visible', emailVisible ? '1' : '0');

      if (pendingPictureFile) formData.append("profile_picture", pendingPictureFile);

      await updateProfile(id, formData);

      const updated = await getProfile(id);
      setProfile(updated);
      setEmailVisible(!!updated.email_visible);
      setPendingChanges({});
      setPendingPictureFile(null);
      setPendingPicturePreview(null);
      setPendingPictureRemove(false);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── social links ─── */
  const handleEditSocialLink = (social) => {
    setSocialPlatform(social.platform);
    setSocialUrl(social.url);
    setShowSocialForm(true);
  };

  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    if (!socialPlatform || !socialUrl) return;
    try {
      const data = await addSocialLink(id, { platform: socialPlatform, url: socialUrl });
      const saved = data.social_link;
      setProfile(prev => {
        const links = prev.social_links || [];
        const idx = links.findIndex(s => s.platform?.toLowerCase() === saved.platform?.toLowerCase());
        const next = idx >= 0 ? links.map((s, i) => i === idx ? saved : s) : [...links, saved];
        return { ...prev, social_links: next };
      });
      setSocialPlatform(""); setSocialUrl(""); setShowSocialForm(false);
    } catch { alert("Failed to save social link."); }
  };

  const handleDeleteSocialLink = async (socialId) => {
    try {
      await deleteSocialLink(id, socialId);
      setProfile(prev => ({ ...prev, social_links: prev.social_links.filter(s => s.id !== socialId) }));
    } catch { alert("Failed to delete social link."); }
  };

  /* ─── services ─── */
  const handleDeleteService = async (serviceId) => {
    try {
      await deleteService(serviceId, profile.user_id);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch { alert("Failed to delete service."); }
  };

  const handleServiceUpdated = (updated) => {
    setServices(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
  };

  const filteredServices = services.filter(s => {
    if (!serviceSearch.trim()) return true;
    const q = serviceSearch.toLowerCase();
    return s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) ||
           s.category_name?.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q);
  });

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  /* ─── derived display values ─── */
  const dv = { ...profile, ...pendingChanges }; // display values during edit

  const showPicture = pendingPicturePreview
    ? true
    : (profile?.has_profile_picture && !pendingPictureRemove);

  /* ─── loading / error states ─── */
  if (loading) return (
    <div className="profile-loading-container">
      <div className="profile-spinner"></div>
      <p>Loading profile…</p>
    </div>
  );

  if (error || !profile) return (
    <div className="profile-error-container">
      <div className="error-card">
        <span className="error-icon"><i className="fa-solid fa-triangle-exclamation"></i></span>
        <h2>Profile Unavailable</h2>
        <p>{error || "We couldn't find the requested user profile."}</p>
        <Link to="/services" className="btn-back-services">← Explore Services</Link>
      </div>
    </div>
  );

  /* ─────────────── render ─────────────── */
  return (
    <div className="profile-page-wrapper">

      {/* ── Cover Banner ── */}
      <div className="profile-cover-banner">
        <div className="cover-ambient-shape cover-shape-1"></div>
        <div className="cover-ambient-shape cover-shape-2"></div>
        <div className="cover-top-bar">
          <Link to="/services" className="profile-breadcrumb-link">
            <i className="fa-solid fa-arrow-left"></i> Back to Services
          </Link>
          <div className="profile-banner-tags">
            {isOwnProfile && <span className="profile-tag tag-own"><i className="fa-solid fa-star"></i> Your Account</span>}
            {!isOwnProfile && isAdmin && <span className="profile-tag tag-admin"><i className="fa-solid fa-shield-halved"></i> Viewing as Admin</span>}
            {profile.role === 'admin' && <span className="profile-tag tag-role-admin"><i className="fa-solid fa-bolt"></i> Admin</span>}
          </div>
        </div>
      </div>

      <div className="profile-main-container">

        {/* ════════════════════════════════════════
            PROFILE CARD  (identity + info + social)
            ════════════════════════════════════════ */}
        <div className="profile-card">

          {/* Avatar & name row */}
          <div className="profile-card-hero">
            <div className="profile-avatar-wrapper">
              {showPicture ? (
                <div className="profile-avatar profile-avatar-large">
                  <img
                    src={pendingPicturePreview || `${API_URL}/profiles/${profile.user_id}/profile-picture?t=${Date.now()}`}
                    alt="Profile"
                  />
                </div>
              ) : (
                <ProfileAvatar
                  userId={profile.user_id}
                  name={dv.name}
                  hasProfilePicture={false}
                  size="large"
                />
              )}
              <div className="avatar-status-indicator" title="Active user"></div>

              {/* picture controls — only visible in edit mode */}
              {canEdit && isEditing && (
                <div className="avatar-edit-overlay">
                  <label htmlFor="profile-picture-upload" className="avatar-edit-btn" title="Change picture">
                    <i className="fa-solid fa-camera"></i>
                  </label>
                  <input id="profile-picture-upload" type="file" accept="image/*" hidden onChange={handlePictureChange} />
                  {showPicture && (
                    <button type="button" className="avatar-remove-btn" onClick={handleRemovePicture} title="Remove picture">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="profile-identity-block">
              {/* Name */}
              {isEditing ? (
                <input
                  className="profile-name-input"
                  type="text"
                  name="name"
                  value={dv.name || ""}
                  onChange={handleFieldChange}
                  placeholder="Full name…"
                />
              ) : (
                <h1 className="profile-full-name">{profile.name}</h1>
              )}

              {/* Sub-details */}
              <div className="identity-sub-details">
                {profile.profile_created_at && (
                  <span className="detail-item">
                    <i className="fa-regular fa-calendar"></i>
                    Member since {formatDate(profile.profile_created_at)}
                  </span>
                )}
                <span className="detail-item">
                  <i className="fa-solid fa-briefcase"></i>
                  {services.length} {services.length === 1 ? "Service" : "Services"}
                </span>
              </div>

              {/* Social link icons */}
              {profile.social_links?.length > 0 && (
                <div className="profile-social-pills">
                  {profile.social_links.map(social => (
                    <div key={social.id} className="social-pill-wrapper">
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className="social-pill-btn"
                        title={social.platform}
                        onClick={isEditing ? (e) => { e.preventDefault(); handleEditSocialLink(social); } : undefined}
                      >
                        {getSocialIcon(social.platform)}
                      </a>
                      {isEditing && (
                        <button className="social-remove-btn" onClick={() => handleDeleteSocialLink(social.id)} title="Remove">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && !showSocialForm && (
                    <button className="add-social-btn" onClick={() => { setSocialPlatform(""); setSocialUrl(""); setShowSocialForm(true); }}>
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  )}
                </div>
              )}

              {/* Add first social link button */}
              {isEditing && profile.social_links?.length === 0 && !showSocialForm && (
                <button className="add-social-btn add-social-text" onClick={() => { setSocialPlatform(""); setSocialUrl(""); setShowSocialForm(true); }}>
                  <i className="fa-solid fa-plus"></i> Add Social Link
                </button>
              )}
            </div>

            {/* Header action buttons (top-right) */}
            <div className="profile-header-actions">
              {canEdit && !isEditing && (
                <button className="btn-profile-edit" onClick={() => setIsEditing(true)}>
                  <i className="fa-solid fa-pen"></i> Edit Profile
                </button>
              )}
              {isOwnProfile && !isEditing && (
                <Link to={`/users/${profile.user_id}/requests`} className="btn-profile-action btn-my-requests">
                  <i className="fa-solid fa-clipboard-list"></i> My Requests
                </Link>
              )}
              {!isOwnProfile && currentUser && !isEditing && (
                <Link to={`/messages?userId=${profile.user_id}`} className="btn-profile-action btn-message">
                  <i className="fa-regular fa-message"></i> Message
                </Link>
              )}
            </div>
          </div>

          {/* Social link form (shown in edit mode) */}
          {isEditing && showSocialForm && (
            <form onSubmit={handleAddSocialLink} className="inline-social-form">
              <select value={socialPlatform} onChange={e => { setSocialPlatform(e.target.value); const ex = profile?.social_links?.find(s => s.platform?.toLowerCase() === e.target.value); if (ex) setSocialUrl(ex.url); }} required>
                <option value="">Select Platform…</option>
                {['github','linkedin','instagram','facebook','x','youtube','portfolio'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <input type="url" placeholder="https://…" value={socialUrl} onChange={e => setSocialUrl(e.target.value)} required />
              <div className="social-form-actions">
                <button type="button" className="btn-cancel-social" onClick={() => { setSocialPlatform(""); setSocialUrl(""); setShowSocialForm(false); }}>Cancel</button>
                <button type="submit" className="btn-save-social">
                  {profile?.social_links?.some(s => s.platform?.toLowerCase() === socialPlatform?.toLowerCase()) ? "Update" : "Add"}
                </button>
              </div>
            </form>
          )}

          {/* ── Info grid (bio + contact in one tight area) ── */}
          <div className="profile-info-grid">

            {/* Bio */}
            <div className="profile-info-section bio-section">
              <h3 className="info-section-label">About</h3>
              {isEditing ? (
                <textarea
                  className="profile-bio-input"
                  name="bio"
                  value={dv.bio || ""}
                  onChange={handleFieldChange}
                  rows={4}
                  placeholder="Tell people about yourself and your skills…"
                />
              ) : (
                profile.bio
                  ? <p className="profile-bio-text">{profile.bio}</p>
                  : <p className="empty-info-note">No bio provided.</p>
              )}
            </div>

            {/* Contact info */}
            <div className="profile-info-section contact-section">
              <h3 className="info-section-label">Contact & Info</h3>
              <div className="contact-items">

                {/* Email — read-only with visibility toggle */}
                {(profile.email || currentUser?.email) && (
                  <div className="contact-item">
                    <span className="contact-icon"><i className="fa-solid fa-envelope"></i></span>
                    <div className="contact-text">
                      {isEditing ? (
                        <div className="email-edit-row">
                          <span className="contact-value email-readonly">
                            {profile.email || currentUser?.email}
                          </span>
                          <label className="email-visibility-toggle" title={emailVisible ? "Hide email from others" : "Show email publicly"}>
                            <input
                              type="checkbox"
                              checked={emailVisible}
                              onChange={e => setEmailVisible(e.target.checked)}
                            />
                            <span className="toggle-label">
                              <i className={`fa-solid ${emailVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                              {emailVisible ? " Public" : " Hidden"}
                            </span>
                          </label>
                        </div>
                      ) : (
                        isOwnProfile || (emailVisible && profile.email) ? (
                          <a href={`mailto:${profile.email || currentUser?.email}`} className="contact-value link-highlight">
                            {profile.email || currentUser?.email}
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {(canEdit || dv.phone) && (
                  <div className="contact-item">
                    <span className="contact-icon"><i className="fa-solid fa-phone"></i></span>
                    <div className="contact-text">
                      {isEditing ? (
                        <input className="contact-input" type="tel" name="phone" value={dv.phone || ""} onChange={handleFieldChange} placeholder="Phone number…" />
                      ) : dv.phone ? (
                        <a href={`tel:${dv.phone}`} className="contact-value link-highlight">{dv.phone}</a>
                      ) : (
                        <span className="empty-info-note">No phone provided.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(canEdit || dv.location) && (
                  <div className="contact-item">
                    <span className="contact-icon"><i className="fa-solid fa-location-dot"></i></span>
                    <div className="contact-text">
                      {isEditing ? (
                        <input className="contact-input" type="text" name="location" value={dv.location || ""} onChange={handleFieldChange} placeholder="City, Country…" />
                      ) : dv.location ? (
                        <span className="contact-value">{dv.location}</span>
                      ) : (
                        <span className="empty-info-note">No location provided.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Website */}
                {(canEdit || dv.website) && (
                  <div className="contact-item">
                    <span className="contact-icon"><i className="fa-solid fa-globe"></i></span>
                    <div className="contact-text">
                      {isEditing ? (
                        <input className="contact-input" type="url" name="website" value={dv.website || ""} onChange={handleFieldChange} placeholder="https://…" />
                      ) : dv.website ? (
                        <a href={dv.website.startsWith("http") ? dv.website : `https://${dv.website}`} target="_blank" rel="noreferrer" className="contact-value link-highlight">
                          {dv.website.replace(/^https?:\/\//i, "")}
                        </a>
                      ) : (
                        <span className="empty-info-note">No website provided.</span>
                      )}
                    </div>
                  </div>
                )}

                {!canEdit && !dv.phone && !dv.location && !dv.website && !(emailVisible && profile.email) && (
                  <p className="empty-info-note">No public contact info provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Edit mode footer: save error + action buttons ── */}
          {isEditing && (
            <div className="profile-edit-footer">
              {saveError && (
                <div className="profile-save-error">
                  <i className="fa-solid fa-circle-exclamation"></i> {saveError}
                </div>
              )}
              <div className="profile-edit-actions">
                <button className="btn-cancel-changes" onClick={handleCancelEdit} disabled={isSaving}>
                  <i className="fa-solid fa-xmark"></i> Cancel Changes
                </button>
                <button className="btn-save-changes" onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving…</>
                    : <><i className="fa-solid fa-floppy-disk"></i> Save Profile</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════
            SERVICES SECTION
            ════════════════════════════════════════ */}
        <div className="services-section-wrapper">
          <div className="services-section-header">
            <div className="services-title-group">
              <h2>{isOwnProfile ? "My Services" : `Services by ${profile.name}`}</h2>
              <span className="services-count-badge">{services.length}</span>
            </div>
            {canEdit && (
              <Link to="/services/new" className="btn-post-service-secondary">
                <i className="fa-solid fa-plus"></i> Post Service
              </Link>
            )}
          </div>

          {services.length > 0 && (
            <div className="services-filter-bar">
              <div className="search-input-wrapper">
                <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
                <input
                  type="text"
                  placeholder="Search services…"
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="service-search-input"
                />
                {serviceSearch && (
                  <button type="button" onClick={() => setServiceSearch("")} className="clear-search-btn">
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
              <p>{isOwnProfile
                ? "You haven't published any services yet. Create one to start receiving requests!"
                : `${profile.name} hasn't listed any services yet.`}
              </p>
              {canEdit && <Link to="/services/new" className="btn-cta-primary">+ Create First Service</Link>}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="empty-services-state no-search-matches">
              <div className="empty-icon-wrap"><i className="fa-solid fa-magnifying-glass"></i></div>
              <h3>No matching services</h3>
              <p>No services matched "{serviceSearch}".</p>
              <button type="button" onClick={() => setServiceSearch("")} className="btn-reset-search">Clear Filter</button>
            </div>
          ) : (
            <div className="profile-services-grid">
              {filteredServices.map(service => (
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
      </div>
    </div>
  );
};

export default UserProfile;