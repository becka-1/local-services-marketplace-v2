import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getRequestById, updateRequest, deleteRequest } from "../services/requestApi.js";
import ServiceDetailsModal from "../components/ServiceDetailsModal.jsx";
import './RequestDetails.css';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewerId, setViewerId] = useState(""); // Temporary auth
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
      alert("Status updated successfully.");
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this request?");
    if (!confirmed) return;

    try {
      await updateRequest(id, { status: 'cancelled' });
      setRequest({ ...request, status: 'cancelled' });
      alert("Request cancelled.");
    } catch (err) {
      alert("Failed to cancel request.");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to completely delete this request?");
    if (!confirmed) return;

    try {
      await deleteRequest(id);
      navigate(`/users/${viewerId}/requests`);
    } catch (err) {
      alert("Failed to delete request.");
    }
  };

  if (loading) return <p>Loading request...</p>;
  if (error) return <p>{error}</p>;

  const isRequester = Number(viewerId) === Number(request.requester_id);
  const isProvider = Number(viewerId) === Number(request.provider_id);

  return (
    <main className="request-details-page">
      <Link to={viewerId ? `/users/${viewerId}/requests` : "/services"}>← Back</Link>
      
      <div className="auth-simulation">
        <label>Simulate logged-in User ID: </label>
        <input 
          type="number" 
          value={viewerId} 
          onChange={(e) => setViewerId(e.target.value)}
          placeholder="Enter ID"
        />
        <p className="auth-hint">
          <small>(Enter <strong>{request.requester_id}</strong> to view as requester, or <strong>{request.provider_id}</strong> to view as provider)</small>
        </p>
      </div>

      <section className="details-card">
        <h1>Request Details</h1>
        <h2>
          Service:{" "}
          <button
            type="button"
            className="service-link-btn"
            onClick={() => setIsServiceModalOpen(true)}
          >
            {request.service_title} 🔍
          </button>
        </h2>
        
        <p><strong>Status:</strong> <span className={`status-${request.status}`}>{request.status}</span></p>
        <p><strong>Date:</strong> {new Date(request.created_at).toLocaleString()}</p>
        
        <div className="message-box">
          <h3>Message:</h3>
          <p>{request.message}</p>
        </div>

        <div className="participants">
          <div className="participant-info">
            <h3>Requester Info</h3>
            <p><strong>Name:</strong> {request.requester_name}</p>
            <p><strong>Phone:</strong> {request.requester_phone}</p>
            <p><strong>Email:</strong> {request.requester_email || "N/A"}</p>
          </div>
          <div className="participant-info">
            <h3>Provider Info</h3>
            <p><strong>Name:</strong> {request.provider_name}</p>
          </div>
        </div>
      </section>

      {isRequester && request.status === 'pending' && (
        <section className="actions-section">
          <h3>Requester Actions</h3>
          <div className="action-buttons">
            <Link to={`/requests/${id}/edit`}><button>Edit Message</button></Link>
            <button onClick={handleCancel}>Cancel Request</button>
            <button onClick={handleDelete} className="danger-btn">Delete Request</button>
          </div>
        </section>
      )}

      {isProvider && (
        <section className="actions-section">
          <h3>Provider Actions</h3>
          <div className="status-update-form">
            <select 
              value={statusUpdate} 
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={handleStatusUpdate} disabled={updating || statusUpdate === request.status}>
              {updating ? "Updating..." : "Update Status"}
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
