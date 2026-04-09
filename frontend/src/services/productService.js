export const getProducts = async () => {
  const res = await fetch("http://localhost:5000/api/products");
  return res.json();
};
export const createProduct = async (productData) => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  return res.json();
};

export const deleteProduct = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const updateProduct = async (id, data) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const getProductById = async (id) => {
  const res = await fetch(`http://localhost:5000/api/products/${id}`);
  return res.json();
};
