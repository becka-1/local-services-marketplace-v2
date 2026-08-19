import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../services/profileApi.js";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUserId, setCurrentUserIdState] = useState(() => {
    return localStorage.getItem("current_user_id") || "1";
  });

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const setCurrentUserId = (id) => {
    const stringId = String(id);
    setCurrentUserIdState(stringId);
    localStorage.setItem("current_user_id", stringId);
  };

  const loadCurrentUserProfile = async (id) => {
    if (!id) return;
    try {
      setLoadingUser(true);
      const data = await getProfile(id);
      setCurrentUserProfile(data);
    } catch (err) {
      console.warn("Could not load current user profile for ID:", id);
      setCurrentUserProfile(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadCurrentUserProfile(currentUserId);
  }, [currentUserId]);

  const refreshCurrentUser = () => {
    loadCurrentUserProfile(currentUserId);
  };

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        currentUserProfile,
        loadingUser,
        refreshCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
