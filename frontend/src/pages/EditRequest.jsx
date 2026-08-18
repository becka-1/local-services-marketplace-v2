import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getRequestById, updateRequest } from "../services/requestApi.js";

const EditRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const data = await getRequestById(id);
        setRequest(data);
        setMessage(data.message);
      } catch (err) {
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      setUpdating(true);
      await updateRequest(id, { message });
      navigate(`/requests/${id}`);
    } catch (err) {
      alert("Failed to update message.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="create-request-page">
      <Link to={`/requests/${id}`}>← Back to Request</Link>
      <h1>Edit Request Message</h1>
      <p>Service: {request.service_title}</p>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label>Message to Provider:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows="5"
          />
        </div>
        <button type="submit" disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
};

export default EditRequest;
