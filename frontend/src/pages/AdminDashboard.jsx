import { useState, useEffect } from "react";
import api from "../services/api.js";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersRes, servicesRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/services")
        ]);
        setUsers(usersRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Admin Dashboard...</div>;
  if (error) return <div style={{ padding: "40px", color: "red", textAlign: "center" }}>{error}</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
      <h1 style={{ marginBottom: "32px" }}>Admin Dashboard</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        
        {/* Users Section */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2>Users ({users.length})</h2>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {users.map(u => (
              <div key={u.id} style={{ borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
                <strong>{u.name || 'No Profile'}</strong> ({u.email})
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Role: <span style={{ color: u.role === 'admin' ? "blue" : "black" }}>{u.role}</span> | 
                  Joined: {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Services Section */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <h2>Services ({services.length})</h2>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {services.map(s => (
              <div key={s.id} style={{ borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
                <strong>{s.title}</strong>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Provider: {s.provider_name} | Price: ${s.price}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
