import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getAdminRequests } from "../../services/adminApi.js";
import { deleteRequest } from "../../services/requestApi.js";

const RequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminRequests();
      setRequests(data);
    } catch (err) {
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (reqItem) => {
    if (!window.confirm(`Are you sure you want to delete this request?`)) return;
    try {
      await deleteRequest(reqItem.id);
      fetchRequests();
    } catch (err) {
      alert("Failed to delete request.");
    }
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div className="admin-tab-header">
        <h2>Request Management ({requests.length})</h2>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service Title</th>
              <th>Requester</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.service_title}</td>
                <td>{r.requester_name || 'Unknown'} (ID: {r.requester_id})</td>
                <td>{r.provider_name || 'Unknown'} (ID: {r.provider_id})</td>
                <td>
                  <span className={`admin-badge status-${r.status}`}>{r.status}</span>
                </td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    <Link to={`/requests/${r.id}`}>
                      <button className="admin-btn-view">View / Manage</button>
                    </Link>
                    <button className="admin-btn-delete" onClick={() => handleDelete(r)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTab;
