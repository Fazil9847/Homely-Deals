import { API_URL } from "../config";

export const SESSION_EXPIRED_MESSAGE = "Session expired. Please login to continue.";

export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    window.dispatchEvent(
      new CustomEvent("tokenExpired", {
        detail: { message: SESSION_EXPIRED_MESSAGE },
      }),
    );
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  return res;
};
