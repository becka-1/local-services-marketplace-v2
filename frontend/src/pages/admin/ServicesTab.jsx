import { useState, useEffect } from "react";
import { getAdminServices } from "../../services/adminApi.js";
import { deleteService } from "../../services/serviceApi.js";
import ServiceDetailsModal from "../../components/ServiceDetailsModal.jsx";
import EditServiceModal from "../../components/EditServiceModal.jsx";

const ServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getAdminServices();
      setServices(data);
    } catch (err) {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleView = (id) => {
    setSelectedServiceId(id);
    setIsDetailsOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedServiceId(id);
    setIsEditOpen(true);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.title}"?`)) return;
    try {
      await deleteService(service.id);
      fetchServices();
    } catch (err) {
      alert("Failed to delete service.");
    }
  };

  if (loading) return <div>Loading services...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div className="admin-tab-header">
        <h2>Service Management ({services.length})</h2>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Provider</th>
              <th>Price (ETB)</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.title}</td>
                <td>{s.provider_name || 'Unknown'}</td>
                <td>{s.price || 'Negotiable'}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn-view" onClick={() => handleView(s.id)}>View</button>
                    <button className="admin-btn-edit" onClick={() => handleEdit(s.id)}>Edit</button>
                    <button className="admin-btn-delete" onClick={() => handleDelete(s)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ServiceDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedServiceId(null);
        }} 
        serviceId={selectedServiceId} 
      />

      <EditServiceModal 
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedServiceId(null);
        }}
        serviceId={selectedServiceId}
        onServiceUpdated={() => fetchServices()}
      />
    </div>
  );
};

export default ServicesTab;
