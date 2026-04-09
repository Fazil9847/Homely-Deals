export const getSettings = async () => {
  const res = await fetch("http://localhost:5000/api/settings");
  return res.json();
};

export const updateSettings = async (data) => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
