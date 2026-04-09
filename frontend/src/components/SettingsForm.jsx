import { useState, useEffect } from "react";
import { updateSettings, getSettings } from "../services/settingsService";

const emptyExtraLink = () => ({
  id: Date.now() + Math.random(),
  title: "",
  url: ""
});

function SettingsForm({ onUpdate }) {
  const [form, setForm] = useState({
    shopName: "",
    phone: "",
    email: "",
    businessHours: "",
    location: "",
    mapLink: "",
    instagram: "",
    facebook: "",
    extraLinks: [emptyExtraLink()],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();

        if (data) {
     const savedExtraLinks =
  Array.isArray(data.extraLinks) && data.extraLinks.length > 0
    ? data.extraLinks.map(link => ({
        id: link._id || Date.now() + Math.random(),
        title: link.title || "",
        url: link.url || ""
      }))
                : [emptyExtraLink()];

          setForm({
            shopName: data.shopName || "",
            phone: data.phone || "",
            email: data.email || "",
            businessHours: data.businessHours || "",
            location: data.location || "",
            mapLink: data.mapLink || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            extraLinks: savedExtraLinks,
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

  const handleExtraLinkChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      extraLinks: prev.extraLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link,
      ),
    }));
  };

  const addExtraLink = () => {
    setForm((prev) => ({
      ...prev,
      extraLinks: [...prev.extraLinks, emptyExtraLink()],
    }));
  };
const removeExtraLink = (index) => {
  setForm((prev) => ({
    ...prev,
    extraLinks: prev.extraLinks.filter((_, i) => i !== index),
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const cleanedLinks = form.extraLinks
  .map(link => ({
    title: link.title.trim(),
    url: link.url.trim()
  }))
  .filter(link => link.title && link.url);

await updateSettings({
  ...form,
  extraLinks: cleanedLinks
});
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
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="mb-3 w-full rounded border p-2"
      />

      <input
        name="businessHours"
        value={form.businessHours}
        onChange={handleChange}
        placeholder="Business Hours (e.g. Mon - Fri, 9:00 AM - 6:00 PM)"
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

      <div className="mb-4 rounded-xl border border-gray-200 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Custom Footer Links</h3>
            <p className="text-xs text-gray-500">
              Add links like Catalogue, Website, Brochure, or anything else.
            </p>
          </div>

          <button
            type="button"
            onClick={addExtraLink}
            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black"
          >
            Add Link
          </button>
        </div>

        <div className="space-y-3">
          {form.extraLinks.map((link, index) => (
            <div
          key={index}
              className="rounded-xl border border-gray-200 p-3"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
                <input
                  value={link.title}
                  onChange={(e) =>
                    handleExtraLinkChange(index, "title", e.target.value)
                  }
                  placeholder="Link Title"
                  className="w-full rounded border p-2"
                />

                <input
                  value={link.url}
                  onChange={(e) =>
                    handleExtraLinkChange(index, "url", e.target.value)
                  }
                  placeholder="Link URL"
                  className="w-full rounded border p-2"
                />

                <button
                  type="button"
                  onClick={() => removeExtraLink(index)}
                  className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
