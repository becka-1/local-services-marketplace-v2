import api from "./api.js";

export const getProfile = async (userId) => {
  const response = await api.get(
    `/profiles/${userId}`
  );

  return response.data;
};

export const updateProfile = async (
  userId,
  profileData
) => {
  const response = await api.put(
    `/profiles/${userId}`,
    profileData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteProfilePicture = async (
  userId
) => {
  const response = await api.delete(
    `/profiles/${userId}/profile-picture`
  );

  return response.data;
};

export const addSocialLink = async (
  userId,
  socialData
) => {
  const response = await api.post(
    `/profiles/${userId}/social-links`,
    {
      ...socialData,
    }
  );

  return response.data;
};

export const deleteSocialLink = async (
  userId,
  socialId
) => {
  const response = await api.delete(
    `/profiles/${userId}/social-links/${socialId}`,
    {}
  );

  return response.data;
};