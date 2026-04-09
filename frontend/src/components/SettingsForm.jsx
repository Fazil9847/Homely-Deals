import { useState, useEffect } from "react";
import { updateSettings, getSettings } from "../services/settingsService";

function SettingsForm({ onUpdate }) {
  const [form, setForm] = useState({
    shopName: "",
    phone: "",
    location: "",
    mapLink: "",
    instagram: "",
    facebook: "",
    otherLink: "",
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
            mapLink: data.mapLink || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            otherLink: data.otherLink || "",
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
      onUpdate?.();

      alert("Settings updated");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form className="mb-6 rounded-2xl bg-white p-5 shadow" onSubmit={handleSubmit}>
      <h2 className="mb-4 text-lg font-semibold">Shop Settings</h2>

      <input
        name="shopName"
        value={form.shopName}
        onChange={handleChange}
        placeholder="Shop Name"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone (with country code)"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location / Address"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="mapLink"
        value={form.mapLink}
        onChange={handleChange}
        placeholder="Google Maps Link"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="instagram"
        value={form.instagram}
        onChange={handleChange}
        placeholder="Instagram Link"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="facebook"
        value={form.facebook}
        onChange={handleChange}
        placeholder="Facebook Link"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="otherLink"
        value={form.otherLink}
        onChange={handleChange}
        placeholder="Other Link"
        className="mb-4 w-full rounded border p-2"
      />

      <button
        className="w-full rounded bg-black px-4 py-2 text-white"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}

export default SettingsForm;
