import { useState, useEffect } from "react";
import { getAdminReports, updateAdminReportStatus } from "../../services/adminApi.js";

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAdminReports();
      setReports(data);
    } catch (err) {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAdminReportStatus(id, status);
      fetchReports();
    } catch (err) {
      alert("Failed to update report status.");
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div className="admin-tab-header">
        <h2>Reports Management</h2>
      </div>
      
      {reports.length === 0 ? (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-light-blue)", padding: "32px 24px", borderRadius: "16px", textAlign: "center", color: "var(--color-text-muted)" }}>
          No reports found.
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Item ID</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.reported_item_type}</td>
                  <td>{r.reported_item_id}</td>
                  <td>{r.reporter_name || `User ID: ${r.reporter_id}`}</td>
                  <td style={{ maxWidth: "250px", wordWrap: "break-word" }}>{r.reason}</td>
                  <td>
                    <span className={`admin-badge status-${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {r.status === 'pending' && (
                        <>
                          <button className="admin-btn-edit" onClick={() => handleUpdateStatus(r.id, 'resolved')}>Resolve</button>
                          <button className="admin-btn-view" onClick={() => handleUpdateStatus(r.id, 'dismissed')}>Dismiss</button>
                        </>
                      )}
                      {r.status !== 'pending' && (
                        <button className="admin-btn-view" onClick={() => handleUpdateStatus(r.id, 'pending')}>Re-open</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
