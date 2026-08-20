import { useState, useEffect } from "react";
import { getAdminStats } from "../../services/adminApi.js";

const StatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="admin-tab-header">
        <h2>Marketplace Overview</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Services</h3>
          <p>{stats.totalServices}</p>
        </div>
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p>{stats.totalRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{stats.pendingRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Requests</h3>
          <p>{stats.completedRequests}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
