import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../services/authApi.js";
import { getProfile } from "../services/profileApi.js";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Auth user details from JWT
  const [currentUserProfile, setCurrentUserProfile] = useState(null); // Full profile details
  const [loadingUser, setLoadingUser] = useState(true);

  // Authenticate user on load
  const loadAuthUser = async () => {
    try {
      setLoadingUser(true);
      const data = await getMe();
      setCurrentUser(data.user);
      
      // Also fetch full profile data for their provider profile view
      try {
        const profileData = await getProfile(data.user.id);
        setCurrentUserProfile(profileData);
      } catch (profileErr) {
        console.warn("Could not load full profile data:", profileErr);
      }
    } catch (err) {
      console.warn("Could not load authenticated user.");
      setCurrentUser(null);
      setCurrentUserProfile(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadAuthUser();

    // Listen for 401 Unauthorized events from axios
    const handleAuthFailed = () => {
      setCurrentUser(null);
      setCurrentUserProfile(null);
    };

    window.addEventListener('auth-failed', handleAuthFailed);
    return () => window.removeEventListener('auth-failed', handleAuthFailed);
  }, []);

  const refreshCurrentUser = () => {
    loadAuthUser();
  };

  // Utility to clear user when logging out
  const handleLogoutSuccess = () => {
    setCurrentUser(null);
    setCurrentUserProfile(null);
  };

  // Computed properties
  const currentUserId = currentUser ? currentUser.id.toString() : null;
  const isAuthenticated = !!currentUser;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentUserId,
        isAuthenticated,
        currentUserProfile,
        loadingUser,
        refreshCurrentUser,
        handleLogoutSuccess,
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
