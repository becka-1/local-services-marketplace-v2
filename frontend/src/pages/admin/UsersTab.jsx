import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getAdminUsers, updateAdminUserRole, deleteAdminUser } from "../../services/adminApi.js";

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name || user.email}'s role to ${newRole}?`)) return;
    try {
      await updateAdminUserRole(user.id, newRole);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete user ${user.name || user.email}?`)) return;
    try {
      await deleteAdminUser(user.id);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div className="admin-tab-header">
        <h2>User Management ({users.length})</h2>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name || <span style={{ color: "#94a3b8" }}>No Profile</span>}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>
                  <span className={`admin-badge role-${u.role}`}>{u.role}</span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    <Link to={`/users/${u.id}`}>
                      <button className="admin-btn-view">View</button>
                    </Link>
                    <button className="admin-btn-edit" onClick={() => handleToggleRole(u)}>
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button className="admin-btn-delete" onClick={() => handleDeleteUser(u)}>
                      Delete
                    </button>
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

export default UsersTab;
