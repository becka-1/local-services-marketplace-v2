const API_URL = "http://localhost:5000/api/requests";

export const createRequest = async (requestData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create request");
  }

  return response.json();
};

export const getRequestsByRequester = async (userId) => {
  const response = await fetch(`${API_URL}/requester/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user requests");
  }

  return response.json();
};

export const getRequestsByProvider = async (userId) => {
  const response = await fetch(`${API_URL}/provider/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch provider requests");
  }

  return response.json();
};

export const getRequestById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch request");
  }

  return response.json();
};

export const updateRequest = async (id, updateData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update request");
  }

  return response.json();
};

export const deleteRequest = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete request");
  }

  return response.json();
};
