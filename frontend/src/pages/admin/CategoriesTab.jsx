import { useState, useEffect } from "react";
import { getCategories } from "../../services/categoryApi.js";
import { createAdminCategory, updateAdminCategory, deleteAdminCategory } from "../../services/adminApi.js";

const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ id: null, name: "", description: "" });
  const [isEditing, setIsEditing] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateAdminCategory(form.id, { name: form.name, description: form.description });
      } else {
        await createAdminCategory({ name: form.name, description: form.description });
      }
      setForm({ id: null, name: "", description: "" });
      setIsEditing(false);
      fetchCategories();
    } catch (err) {
      alert("Failed to save category.");
    }
  };

  const handleEdit = (cat) => {
    setForm({ id: cat.id, name: cat.name, description: cat.description });
    setIsEditing(true);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This might fail if services are using it.`)) return;
    try {
      await deleteAdminCategory(cat.id);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category (it may be in use).");
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div className="admin-tab-header">
        <h2>Category Management</h2>
      </div>

      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-light-blue)", padding: "24px", borderRadius: "16px", marginBottom: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
        <h3 style={{ color: "var(--color-text)", fontSize: "1.1rem", margin: "0 0 16px 0" }}>{isEditing ? "Edit Category" : "Add New Category"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Name</label>
            <input 
              required 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--color-light-blue)", borderRadius: "8px", background: "var(--color-surface-muted)", color: "var(--color-text)", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: "2 1 300px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Description</label>
            <input 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--color-light-blue)", borderRadius: "8px", background: "var(--color-surface-muted)", color: "var(--color-text)", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {isEditing && (
              <button 
                type="button" 
                className="admin-btn-view"
                onClick={() => { setIsEditing(false); setForm({ id: null, name: "", description: "" }); }}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="admin-btn-edit" style={{ padding: "9px 18px", fontWeight: 600 }}>
              {isEditing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="admin-btn-delete" onClick={() => handleDelete(c)}>Delete</button>
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

export default CategoriesTab;
