import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import LoginModal from "./LoginModal.jsx";
import SignupModal from "./SignupModal.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingUser } = useUser();
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
        <p>You must be logged in to view this page.</p>
        <button 
          onClick={() => setShowLogin(true)}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "16px",
            fontWeight: "bold"
          }}
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

  return children;
};

export default ProtectedRoute;
