import { useState } from 'react';
import { API_URL } from '../services/api.js';
import './ProfileAvatar.css';

const ProfileAvatar = ({
  userId,
  name,
  hasProfilePicture = false,
  size = "medium",
}) => {
  const [imageError, setImageError] =
    useState(false);

  const firstLetter =
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "?";

  const imageUrl =
    `${API_URL}/profiles/${userId}/profile-picture`

  const showImage =
    hasProfilePicture && !imageError;

  return (
    <div
      className={`profile-avatar profile-avatar-${size}`}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={name || "Profile"}
          onError={() =>
            setImageError(true)
          }
        />
      ) : (
        <span>
          {firstLetter}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;