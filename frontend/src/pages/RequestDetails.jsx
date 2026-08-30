import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getRequestById, updateRequest, deleteRequest } from "../services/requestApi.js";
import { useUser } from "../context/UserContext.jsx";
import ServiceDetailsModal from "../components/ServiceDetailsModal.jsx";
import './RequestDetails.css';

const STATUS_CONFIG = {
  pending:   { icon: "fa-clock",          label: "Pending" },
  accepted:  { icon: "fa-circle-check",   label: "Accepted" },
  completed: { icon: "fa-flag-checkered", label: "Completed" },
  rejected:  { icon: "fa-circle-xmark",  label: "Rejected" },
  cancelled: { icon: "fa-ban",            label: "Cancelled" },
};

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentUserId, currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin';
  const [statusUpdate, setStatusUpdate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const data = await getRequestById(id);
        setRequest(data);
        setStatusUpdate(data.status);
      } catch (err) {
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const updated = await updateRequest(id, { status: statusUpdate });
      setRequest({ ...request, status: updated.request.status });
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await updateRequest(id, { status: 'cancelled' });
      setRequest({ ...request, status: 'cancelled' });
    } catch (err) {
      alert("Failed to cancel request.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this request?")) return;
    try {
      await deleteRequest(id);
      navigate(`/users/${currentUserId}/requests`);
    } catch (err) {
      alert("Failed to delete request.");
    }
  };

  if (loading) return (
    <main className="request-details-page">
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        <p>Loading request…</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="request-details-page">
      <p style={{ color: 'var(--color-accent-orange)', padding: '40px 0' }}>{error}</p>
    </main>
  );

  const statusCfg = STATUS_CONFIG[request.status] || { icon: "fa-circle", label: request.status };
  const isRequester = Number(currentUserId) === Number(request.requester_id);
  const isProvider  = Number(currentUserId) === Number(request.provider_id);

  return (
    <main className="request-details-page">
      <Link
        to={currentUserId ? `/users/${currentUserId}/requests` : "/services"}
        className="request-back-link"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to Requests
      </Link>

      {/* Main Details Card */}
      <section className="details-card">
        <div className="details-card-top">
          <h1>Request Details</h1>
          <span className={`details-status-pill status-${request.status}`}>
            <i className={`fa-solid ${statusCfg.icon}`}></i>
            {statusCfg.label}
          </span>
        </div>

        <p className="details-service-name">
          Service:{" "}
          <button
            type="button"
            className="service-link-btn"
            onClick={() => setIsServiceModalOpen(true)}
          >
            {request.service_title} <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '0.8em' }}></i>
          </button>
        </p>

        {/* Meta Row */}
        <div className="details-meta-row">
          <span className="details-meta-item">
            <i className="fa-regular fa-calendar"></i>
            {new Date(request.created_at).toLocaleString("en-US", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}
          </span>
        </div>

        {/* Message */}
        <div className="message-box">
          <h3>Message</h3>
          <p>{request.message}</p>
        </div>

        {/* Participants */}
        <div className="participants">
          <div className="participant-info">
            <h3>Requester</h3>
            <p><strong>Name</strong> {request.requester_name}</p>
            <p><strong>Phone</strong> {request.requester_phone || "N/A"}</p>
            <p><strong>Email</strong> {request.requester_email || "N/A"}</p>
          </div>
          <div className="participant-info">
            <h3>Provider</h3>
            <p><strong>Name</strong> {request.provider_name}</p>
            <p><strong>Phone</strong> {request.provider_phone || "N/A"}</p>
            <p><strong>Email</strong> {request.provider_email || "N/A"}</p>
          </div>
        </div>
      </section>

      {/* Requester Actions */}
      {(isRequester || isAdmin) && request.status === 'pending' && (
        <section className="actions-section">
          <h3>Requester Actions</h3>
          <div className="action-buttons">
            <Link to={`/requests/${id}/edit`} className="btn-action">
              <i className="fa-solid fa-pen"></i> Edit Message
            </Link>
            <button type="button" className="btn-action" onClick={handleCancel}>
              <i className="fa-solid fa-ban"></i> Cancel Request
            </button>
            <button type="button" className="btn-action danger" onClick={handleDelete}>
              <i className="fa-solid fa-trash"></i> Delete Request
            </button>
          </div>
        </section>
      )}

      {/* Provider Actions */}
      {(isProvider || isAdmin) && (
        <section className="actions-section">
          <h3>Provider Actions</h3>
          <div className="status-update-form">
            <select
              className="status-select"
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <button
              className="btn-update-status"
              onClick={handleStatusUpdate}
              disabled={updating || statusUpdate === request.status}
            >
              <i className="fa-solid fa-floppy-disk"></i>
              {updating ? "Updating…" : "Update Status"}
            </button>
          </div>
        </section>
      )}

      <ServiceDetailsModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        serviceId={request.service_id}
      />
    </main>
  );
};

export default RequestDetails;
