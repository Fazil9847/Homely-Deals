import { API_URL } from "../config";

export const getSettings = async () => {
  const res = await fetch(`${API_URL}/api/settings`);
  return res.json();
};

export const updateSettings = async (data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
