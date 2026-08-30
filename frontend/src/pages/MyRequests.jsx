import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getRequestsByRequester, getRequestsByProvider } from "../services/requestApi.js";
import './MyRequests.css';

const STATUS_CONFIG = {
  pending:   { icon: "fa-clock",         label: "Pending" },
  accepted:  { icon: "fa-circle-check",  label: "Accepted" },
  rejected:  { icon: "fa-circle-xmark",  label: "Rejected" },
  completed: { icon: "fa-flag-checkered",label: "Completed" },
  cancelled: { icon: "fa-ban",           label: "Cancelled" },
};

const MyRequests = () => {
  const { id } = useParams();
  const [view, setView] = useState("requester");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const data = view === "requester"
          ? await getRequestsByRequester(id)
          : await getRequestsByProvider(id);
        setRequests(data);
      } catch (err) {
        setError("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [id, view]);

  return (
    <main className="my-requests-page">
      {/* Page Header */}
      <div className="requests-header">
        <div className="requests-top-nav">
          <Link to={`/users/${id}`} className="back-link">
            <i className="fa-solid fa-arrow-left"></i> Back to Profile
          </Link>
          <Link to="/services" className="back-link">
            <i className="fa-solid fa-compass"></i> Browse Services
          </Link>
        </div>
        <h1 className="requests-title">My Requests</h1>
        <p className="requests-subtitle">Track and manage all your service requests</p>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={view === "requester" ? "active" : ""}
          onClick={() => setView("requester")}
        >
          <i className="fa-solid fa-paper-plane"></i>
          Sent Requests
        </button>
        <button
          className={view === "provider" ? "active" : ""}
          onClick={() => setView("provider")}
        >
          <i className="fa-solid fa-inbox"></i>
          Received Requests
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="requests-state-box">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading requests…</p>
        </div>
      )}
      {error && (
        <div className="requests-state-box error">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && requests.length === 0 && (
        <div className="requests-state-box empty">
          <i className="fa-regular fa-folder-open"></i>
          <p>No requests found.</p>
          <Link to="/services" className="btn-browse-link">Browse Services</Link>
        </div>
      )}

      {/* Request Cards */}
      {!loading && !error && requests.length > 0 && (
        <div className="requests-grid">
          {requests.map(req => {
            const statusCfg = STATUS_CONFIG[req.status] || { icon: "fa-circle", label: req.status };
            return (
              <div key={req.id} className={`request-card status-border-${req.status}`}>
                {/* Card Header */}
                <div className="request-card-header">
                  <h3 className="request-service-title">{req.service_title}</h3>
                  <span className={`status-pill status-${req.status}`}>
                    <i className={`fa-solid ${statusCfg.icon}`}></i>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Card Meta */}
                <div className="request-card-meta">
                  <span className="meta-item">
                    <i className="fa-solid fa-user"></i>
                    {view === "requester" ? req.provider_name : req.requester_name}
                  </span>
                  <span className="meta-item">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(req.created_at).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>

                {/* Card Footer */}
                <div className="request-card-footer">
                  <Link to={`/requests/${req.id}`} className="btn-view-request">
                    View Details <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MyRequests;
