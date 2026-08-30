import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getRequestById, updateRequest } from "../services/requestApi.js";
import "./EditRequest.css";

const EditRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [message, setMessage]   = useState("");
  const [updating, setUpdating] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const data = await getRequestById(id);
        setRequest(data);
        setMessage(data.message);
      } catch (err) {
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setSaveError("Message cannot be empty.");
      return;
    }
    try {
      setUpdating(true);
      setSaveError("");
      await updateRequest(id, { message });
      navigate(`/requests/${id}`);
    } catch (err) {
      setSaveError("Failed to update message. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <main className="edit-request-page">
      <div className="edit-request-state">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading request…</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="edit-request-page">
      <div className="edit-request-state error">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <p>{error}</p>
      </div>
    </main>
  );

  const charCount = message.length;
  const hasChanged = message !== request.message;

  return (
    <main className="edit-request-page">
      {/* Back link */}
      <Link to={`/requests/${id}`} className="edit-back-link">
        <i className="fa-solid fa-arrow-left"></i> Back to Request
      </Link>

      {/* Card */}
      <div className="edit-request-card">

        {/* Header */}
        <div className="edit-request-header">
          <div className="edit-request-icon">
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
          <div>
            <h1>Edit Request</h1>
            <p className="edit-request-subtitle">
              Updating message for{" "}
              <span className="edit-service-name">{request.service_title}</span>
            </p>
          </div>
        </div>

        {/* Info banner about original message */}
        <div className="edit-original-banner">
          <i className="fa-solid fa-circle-info"></i>
          <span>You can only edit the message. Status changes must be done by the provider.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-request-form">
          <div className="edit-form-group">
            <div className="edit-label-row">
              <label htmlFor="edit-message">Your Message</label>
              <span className={`char-count ${charCount > 500 ? 'over' : ''}`}>
                {charCount} / 500
              </span>
            </div>
            <textarea
              id="edit-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              maxLength={600}
              placeholder="Describe what you need from the provider…"
            />
          </div>

          {saveError && (
            <div className="edit-save-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              {saveError}
            </div>
          )}

          <div className="edit-form-actions">
            <Link to={`/requests/${id}`} className="btn-edit-cancel">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-edit-save"
              disabled={updating || !hasChanged || !message.trim()}
            >
              {updating
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving…</>
                : <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditRequest;
