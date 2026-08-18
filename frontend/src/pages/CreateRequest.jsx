import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getServiceById } from "../services/serviceApi.js";
import { createRequest } from "../services/requestApi.js";
import './CreateRequest.css';

const CreateRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  // Temporary: Requester ID input until auth is implemented
  const [requesterId, setRequesterId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !requesterId) {
      alert("Please provide your Requester ID and a message.");
      return;
    }

    try {
      setSubmitting(true);
      await createRequest({
        service_id: id,
        requester_id: Number(requesterId),
        message: message,
      });
      navigate(`/users/${requesterId}/requests`);
    } catch (err) {
      alert(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="create-request-page">
      <Link to={`/services/${id}`}>← Back to Service</Link>
      <h1>Request Service: {service.title}</h1>
      <p>Provider: {service.provider_name}</p>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label>Your User ID (Temporary Auth):</label>
          <input
            type="number"
            value={requesterId}
            onChange={(e) => setRequesterId(e.target.value)}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Message to Provider:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="5"
            placeholder="Describe what you need..."
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </main>
  );
};

export default CreateRequest;
