import { useState, useEffect } from "react";
import { updateSettings, getSettings } from "../services/settingsService";

function SettingsForm() {
  const [form, setForm] = useState({
    shopName: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();

        if (data) {
          setForm({
            shopName: data.shopName || "",
            phone: data.phone || "",
            location: data.location || "",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await updateSettings(form);

      alert("Settings updated");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="bg-white p-4 rounded shadow mb-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-3">Shop Settings</h2>

      <input
        name="shopName"
        value={form.shopName}
        onChange={handleChange}
        placeholder="Shop Name"
        className="border p-2 rounded w-full mb-2"
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone (with country code)"
        className="border p-2 rounded w-full mb-2"
      />

      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location"
        className="border p-2 rounded w-full mb-2"
      />

      <button
        className="bg-black text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}

export default SettingsForm;
