import { useState } from 'react';
import { requestVerification, confirmVerification } from '../services/profileApi.js';
import './VerificationModal.css';

const VerificationModal = ({ isOpen, onClose, userId, type, contactValue, onVerified }) => {
  const [step, setStep] = useState(1); // 1: Request, 2: Confirm
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!isOpen) return null;
  
  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      await requestVerification(userId, type);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to send verification code to ${type}.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirm = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await confirmVerification(userId, type, code);
      onVerified(type);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Invalid verification code.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setStep(1);
    setCode('');
    setError(null);
    onClose();
  };

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal-content">
        <button className="verification-close-btn" onClick={handleClose}>
          <i className="fa-solid fa-times"></i>
        </button>
        
        <div className="verification-modal-header">
          <h3>Verify your {type === 'email' ? 'Email Address' : 'Phone Number'}</h3>
          <p>
            {type === 'email' 
              ? `We will send a 6-digit code to your email.` 
              : `We will send a 6-digit code to your email to verify your phone number.`}
          </p>
        </div>
        
        <div className="verification-modal-body">
          {error && <div className="verification-error">{error}</div>}
          
          {step === 1 ? (
            <div className="verification-step-request">
              <p>Current {type}: <strong>{contactValue}</strong></p>
              <button 
                className="verification-btn-primary" 
                onClick={handleRequest} 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            <div className="verification-step-confirm">
              <p>Enter the 6-digit code sent to your email.</p>
              <input 
                type="text" 
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="verification-code-input"
              />
              <button 
                className="verification-btn-primary" 
                onClick={handleConfirm} 
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button className="verification-btn-secondary" onClick={handleRequest} disabled={loading}>
                Resend Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
