import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getRequestsByRequester, getRequestsByProvider } from "../services/requestApi.js";
import './MyRequests.css';

const MyRequests = () => {
  const { id } = useParams(); // user id
  const [view, setView] = useState("requester"); // "requester" or "provider"
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError("");
        let data;
        if (view === "requester") {
          data = await getRequestsByRequester(id);
        } else {
          data = await getRequestsByProvider(id);
        }
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
      <div className="requests-top-nav">
        <Link to={`/users/${id}`} className="back-link">
          ← Back to Profile
        </Link>
        <Link to="/services" className="back-link">
          Browse Services
        </Link>
      </div>

      <h1>My Service Requests</h1>
      
      <div className="view-toggle">
        <button 
          className={view === "requester" ? "active" : ""} 
          onClick={() => setView("requester")}
        >
          Requests I've Made
        </button>
        <button 
          className={view === "provider" ? "active" : ""} 
          onClick={() => setView("provider")}
        >
          Requests for My Services
        </button>
      </div>

      {loading && <p>Loading requests...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <p>No requests found.</p>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <h3>Service: {req.service_title}</h3>
              <p>Status: <span className={`status-${req.status}`}>{req.status}</span></p>
              {view === "requester" ? (
                <p>Provider: {req.provider_name}</p>
              ) : (
                <p>Requester: {req.requester_name}</p>
              )}
              <p className="request-date">{new Date(req.created_at).toLocaleDateString()}</p>
              <Link to={`/requests/${req.id}`}>
                <button>View Details</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyRequests;
