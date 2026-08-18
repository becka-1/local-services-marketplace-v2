import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { createRequest } from "../services/requestApi.js";
import "./RequestServiceModal.css";

const RequestServiceModal = ({ isOpen, onClose, service }) => {
  const navigate = useNavigate();
  const [requesterId, setRequesterId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
      setMessage("");
      setCreatedRequestId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requesterId || !message.trim()) {
      setError("Please enter your User ID and a message.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const response = await createRequest({
        service_id: service.id,
        requester_id: Number(requesterId),
        message: message.trim(),
      });

      setSuccess(true);
      if (response?.request?.id) {
        setCreatedRequestId(response.request.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send service request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRequests = () => {
    onClose();
    if (requesterId) {
      navigate(`/users/${requesterId}/requests`);
    } else {
      navigate("/services");
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="modal-header">
            <div>
              <h2>Request Service</h2>
              <p className="modal-service-title">{service.title}</p>
              {service.provider_name && (
                <p className="modal-provider-name">Provider: <strong>{service.provider_name}</strong></p>
              )}
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              &times;
            </button>
          </div>

          {success ? (
            <div className="modal-success">
              <div className="success-icon">✓</div>
              <h3>Request Submitted Successfully!</h3>
              <p>Your request has been sent to the service provider.</p>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Done
                </button>
                <button type="button" className="btn-primary" onClick={handleViewRequests}>
                  View My Requests
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div className="modal-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="requesterId">
                  Your User ID <span className="label-tag">Temporary Auth</span>
                </label>
                <input
                  id="requesterId"
                  type="number"
                  placeholder="e.g. 1, 2, 3..."
                  value={requesterId}
                  onChange={(e) => setRequesterId(e.target.value)}
                  required
                  min="1"
                  autoFocus
                />
                <small className="form-hint">Enter the ID of the user requesting this service.</small>
              </div>

              <div className="form-group">
                <label htmlFor="requestMessage">Message to Provider</label>
                <textarea
                  id="requestMessage"
                  rows="4"
                  placeholder="Explain what service you need, timeline, or any questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Send Request"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RequestServiceModal;
