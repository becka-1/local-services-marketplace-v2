import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { Navigate } from "react-router";
import LoginModal from "./LoginModal.jsx";
import SignupModal from "./SignupModal.jsx";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loadingUser, currentUser } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (!loadingUser && !isAuthenticated) {
      setShowLogin(true);
    }
  }, [loadingUser, isAuthenticated]);

  if (loadingUser) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading user session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Authentication Required</h2>
        <p>You must be logged in as an admin to view this page.</p>
        <button 
          onClick={() => setShowLogin(true)}
          className="btn-primary"
          style={{ marginTop: "16px", padding: "8px 16px" }}
        >
          Log In Now
        </button>
        
        <LoginModal 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
        <SignupModal 
          isOpen={showSignup} 
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
        <p>You do not have permission to access the admin area.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
