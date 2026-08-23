import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext.jsx';
import { registerRequest, registerConfirm, googleLogin as apiGoogleLogin } from '../services/authApi.js';
import './AuthModals.css';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { refreshCurrentUser } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setLoading(true);
      setError('');
      await registerRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      return setError('Please enter a valid 6-digit code.');
    }

    try {
      setLoading(true);
      setError('');
      await registerConfirm(formData.email, code);
      await refreshCurrentUser();
      onClose();
      // Reset state for next time
      setTimeout(() => setStep(1), 300);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification failed.');
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
      setError(err.response?.data?.message || 'Google Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setCode('');
      setError('');
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="auth-modal-backdrop" onClick={handleModalClose}>
        <motion.div
          className="auth-modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          <button className="auth-modal-close" onClick={handleModalClose}>&times;</button>
          
          {step === 1 ? (
            <>
              <h2>Create an Account</h2>
              <p className="auth-modal-subtitle">Join the marketplace to offer or request services.</p>
              
              {error && <div className="auth-error">{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google Signup failed.');
                  }}
                  useOneTap
                />
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                — OR —
              </div>

              <form onSubmit={handleRequestSubmit} className="auth-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. +251..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Min 6 chars"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn-primary auth-btn-submit" disabled={loading}>
                  {loading ? 'Sending Code...' : 'Continue'}
                </button>
              </form>
              
              <div className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="btn-link" onClick={onSwitchToLogin}>
                  Log In
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Verify your Email</h2>
              <p className="auth-modal-subtitle">We sent a 6-digit code to <strong>{formData.email}</strong></p>
              
              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleConfirmSubmit} className="auth-form">
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                    required
                  />
                </div>
                
                <button type="submit" className="btn-primary auth-btn-submit" disabled={loading || code.length !== 6}>
                  {loading ? 'Verifying...' : 'Complete Sign Up'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary auth-btn-submit" 
                  style={{ marginTop: '10px' }}
                  onClick={() => { setStep(1); setError(''); }}
                  disabled={loading}
                >
                  Back
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SignupModal;
