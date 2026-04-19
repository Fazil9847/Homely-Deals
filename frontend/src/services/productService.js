import { API_URL } from "../config";
import { authenticatedFetch } from "../utils/api";

export const getProducts = async () => {
  const res = await fetch(`${API_URL}/api/products`);
  return res.json();
};
export const createProduct = async (productData) => {
  const res = await authenticatedFetch('/api/products', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create product");
  }

  return data;
};

export const deleteProduct = async (id) => {
  const res = await authenticatedFetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
  const data = await res.json();
  throw new Error(data.message || "Unauthorized");
}

  return res.json();
};

export const updateProduct = async (id, data) => {
  const res = await authenticatedFetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
if (!res.ok) {
  const data = await res.json();
  throw new Error(data.message || "Unauthorized");
}

  return res.json();
};

export const getProductById = async (id) => {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  return res.json();
};
