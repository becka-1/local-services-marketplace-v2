import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router";

import {
  getProfile,
  updateProfile,
  deleteProfilePicture,
  addSocialLink,
  deleteSocialLink,
} from "../services/profileApi.js";

import { API_URL } from "../services/api.js";
import './EditProfile.css';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    email: "",
    location: "",
    website: "",
  });

  const [profilePicture, setProfilePicture] =
    useState(null);

  const [picturePreview, setPicturePreview] =
    useState(null);

  const [socialPlatform, setSocialPlatform] =
    useState("");

  const [socialUrl, setSocialUrl] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load profile
  // --------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile(id);

        setProfile(data);

        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          phone: data.phone || "",
          email: data.email || "",
          location: data.location || "",
          website: data.website || "",
        });

        // Show existing profile picture
        if (data.has_profile_picture) {
          setPicturePreview(
            `${API_URL}/profiles/${id}/profile-picture`
          );
        } else {
          setPicturePreview(null);
        }
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  // --------------------------------------------------
  // Clean up temporary image previews
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (
        picturePreview &&
        picturePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  // --------------------------------------------------
  // Handle text inputs
  // --------------------------------------------------

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Handle profile picture selection
  // --------------------------------------------------

  const handlePictureChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    setError("Please select an image file.");
    event.target.value = "";
    return;
  }

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    setError(
      "Profile picture must be smaller than 5 MB."
    );
    event.target.value = "";
    return;
  }

  setError("");

  // Store selected file
  setProfilePicture(file);

  // Show selected image immediately
  const previewUrl = URL.createObjectURL(file);
  setPicturePreview(previewUrl);

  // Make the Remove button appear
  setProfile((previous) => ({
    ...previous,
    has_profile_picture: true,
  }));
};

  // --------------------------------------------------
  // Save profile
  // --------------------------------------------------

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      data.append(
        "name",
        formData.name
      );

      data.append(
        "bio",
        formData.bio
      );

      data.append(
        "phone",
        formData.phone
      );

      data.append(
        "email",
        formData.email
      );

      data.append(
        "location",
        formData.location
      );

      data.append(
        "website",
        formData.website
      );

      if (profilePicture) {
        data.append(
          "profile_picture",
          profilePicture
        );
      }

      await updateProfile(
        id,
        data
      );

      // Go back to profile after saving
      navigate(`/users/${id}`);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete profile picture
  // --------------------------------------------------

  const handleDeletePicture =
    async () => {
      const confirmed =
        window.confirm(
          "Remove your profile picture?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await deleteProfilePicture(id);

        setProfile((previous) => ({
          ...previous,
          has_profile_picture: false,
        }));

        setPicturePreview(null);

        setProfilePicture(null);

        // Reset file input
        const fileInput =
          document.getElementById(
            "profile-picture"
          );

        if (fileInput) {
          fileInput.value = "";
        }
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to delete profile picture."
        );
      }
    };

  // --------------------------------------------------
  // Add social link
  // --------------------------------------------------

  const handleAddSocialLink =
    async (event) => {
      event.preventDefault();

      if (
        !socialPlatform ||
        !socialUrl
      ) {
        setError(
          "Please select a platform and enter a URL."
        );

        return;
      }

      try {
        setError("");

        const data =
          await addSocialLink(id, {
            platform: socialPlatform,
            url: socialUrl,
          });

        setProfile((previous) => ({
          ...previous,

          social_links: [
            ...(previous.social_links ||
              []),
            data.social_link,
          ],
        }));

        setSocialPlatform("");
        setSocialUrl("");
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to add social link."
        );
      }
    };

  // --------------------------------------------------
  // Delete social link
  // --------------------------------------------------

  const handleDeleteSocialLink =
    async (socialId) => {
      try {
        setError("");

        await deleteSocialLink(
          id,
          socialId
        );

        setProfile((previous) => ({
          ...previous,

          social_links:
            previous.social_links.filter(
              (social) =>
                social.id !== socialId
            ),
        }));
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to delete social link."
        );
      }
    };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <main>
        <p>Loading profile...</p>
      </main>
    );
  }

  // --------------------------------------------------
  // Profile not found
  // --------------------------------------------------

  if (!profile) {
    return (
      <main>
        <p>Profile not found.</p>
      </main>
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <main className="edit-profile-page">
      <h1>Edit Profile</h1>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {/* ==========================================
          PROFILE PICTURE
          ========================================== */}

      <section className="profile-picture-editor">
        <div className="profile-picture-preview">
          {picturePreview ? (
            <img
              src={picturePreview}
              alt="Profile preview"
            />
          ) : (
            <span>
              {formData.name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() ||
                "?"}
            </span>
          )}
        </div>

        <label
          htmlFor="profile-picture"
          className="profile-picture-button"
        >
          Choose Profile Picture
        </label>

        <input
          id="profile-picture"
          type="file"
          accept="image/*"
          onChange={
            handlePictureChange
          }
        />

        {profile.has_profile_picture && (
          <button
            type="button"
            onClick={
              handleDeletePicture
            }
          >
            Remove Profile Picture
          </button>
        )}
      </section>

      {/* ==========================================
          PROFILE INFORMATION
          ========================================== */}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            Name *
          </label>

          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">
            Bio
          </label>

          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            Phone *
          </label>

          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">
            Location
          </label>

          <input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">
            Website
          </label>

          <input
            id="website"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Profile"}
        </button>
      </form>

      {/* ==========================================
          SOCIAL LINKS
          ========================================== */}

      <section className="profile-social-editor">
        <h2>Social Links</h2>

        {profile.social_links?.length >
        0 ? (
          <div className="social-links-list">
            {profile.social_links.map(
              (social) => (
                <div
                  key={social.id}
                  className="social-link-item"
                >
                  <div>
                    <strong>
                      {social.platform}
                    </strong>

                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {social.url}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteSocialLink(
                        social.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              )
            )}
          </div>
        ) : (
          <p>
            You haven't added any social
            links yet.
          </p>
        )}

        <form
          onSubmit={
            handleAddSocialLink
          }
          className="add-social-form"
        >
          <div className="form-group">
            <label htmlFor="social-platform">
              Platform
            </label>

            <select
              id="social-platform"
              value={socialPlatform}
              onChange={(event) =>
                setSocialPlatform(
                  event.target.value
                )
              }
            >
              <option value="">
                Select platform
              </option>

              <option value="github">
                GitHub
              </option>

              <option value="linkedin">
                LinkedIn
              </option>

              <option value="instagram">
                Instagram
              </option>

              <option value="facebook">
                Facebook
              </option>

              <option value="x">
                X
              </option>

              <option value="youtube">
                YouTube
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="social-url">
              URL
            </label>

            <input
              id="social-url"
              type="url"
              value={socialUrl}
              onChange={(event) =>
                setSocialUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
            />
          </div>

          <button type="submit">
            Add Link
          </button>
        </form>
      </section>
    </main>
  );
};

export default EditProfile;