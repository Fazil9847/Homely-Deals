import { API_URL } from "../config";
import { authenticatedFetch } from "../utils/api";

export const getSettings = async () => {
  const res = await fetch(`${API_URL}/api/settings`);
  return res.json();
};

export const updateSettings = async (data) => {
  const res = await authenticatedFetch('/api/settings', {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
