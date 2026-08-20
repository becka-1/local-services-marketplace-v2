import api from "./api.js";

export const getFeaturedServices = async () => {
  const response = await api.get("/services/featured");
  return response.data;
};

export const getServices = async (filters = {}) => {
  const response = await api.get("/services", {
    params: filters,
  });

  return response.data;
};

export const getServiceById = async id => {
  const response = await api.get(`/services/${id}`);
  return response.data;
}

export const createService = async (serviceData) => {
  const response = await api.post(
    "/services",
    serviceData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getServiceImages = async (id) => {
  const response = await api.get(
    `/services/${id}/images`
  );

  return response.data;
};

export const updateService = async (
  id,
  serviceData
) => {
  const response = await api.patch(
    `/services/${id}`,
    serviceData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteService = async (id) => {
  const response = await api.delete(
    `/services/${id}`
  );

  return response.data;
};

export const deleteServiceImage = async (serviceId, imageId) => {
  const response = await api.delete(
    `/services/${serviceId}/images/${imageId}`
  );

  return response.data;
};