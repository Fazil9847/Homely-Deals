import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Login({ onLogin, onBack, isModal = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setErrorMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        onLogin();
      } else {
        setErrorMessage(data.message || "Login failed. Please try again.");
      }
    } catch {
      setErrorMessage("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isModal ? "bg-gray-100 px-4 py-10" : "min-h-screen bg-gray-100 px-4 py-10"}>
      <div className="mx-auto max-w-md">
        {!isModal && (
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }

              navigate("/");
            }}
            className="mb-6 inline-flex items-center text-sm text-gray-600 transition hover:text-black"
          >
            Back to Home
          </button>
        )}
        {isModal && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center text-sm text-gray-600 transition hover:text-black"
          >
            Back
          </button>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {isModal ? "Session Expired" : "Owner Access"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              {isModal ? "Please sign in again" : "Sign in to manage your store"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {isModal ? "Your session has expired. Please log in to continue." : "This area is only for the shop owner to manage products and settings."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              name="username"
              value={form.username}
              placeholder="Enter your username"
              onChange={handleChange}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black"
            />

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black"
            />

            {errorMessage && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
