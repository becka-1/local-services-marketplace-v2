import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext.jsx';
import { login, googleLogin as apiGoogleLogin } from '../services/authApi.js';
import './AuthModals.css';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { refreshCurrentUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login({ email, password });
      await refreshCurrentUser();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      await apiGoogleLogin(credentialResponse.credential);
      await refreshCurrentUser();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="auth-modal-backdrop" onClick={onClose}>
        <motion.div
          className="auth-modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          <button className="auth-modal-close" onClick={onClose}>&times;</button>
          <h2>Welcome Back</h2>
          <p className="auth-modal-subtitle">Log in to manage your services and requests.</p>
          
          {error && <div className="auth-error">{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Login failed.');
              }}
              useOneTap
            />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
            — OR —
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="btn-primary auth-btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="auth-switch">
            Don't have an account?{' '}
            <button type="button" className="btn-link" onClick={onSwitchToSignup}>
              Sign Up
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
