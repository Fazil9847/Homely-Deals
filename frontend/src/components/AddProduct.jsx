import { useEffect, useState } from "react";
import { createProduct } from "../services/productService";
import { normalizeWoodTypes, WOOD_TYPE_OPTIONS } from "../utils/productUtils";

const CATEGORY_OPTIONS = ["Chair", "Table", "Sofa", "Bed", "Other"];
const AVAILABILITY_OPTIONS = [
  "In stock",
  "Made to order",
  "Out of stock",
  "Available on enquiry",
];

const padDatePart = (value) => String(value).padStart(2, "0");

const formatDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate()
  )}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};

const INITIAL_FORM = {
  name: "",
  description: "",
  woodType: [],
  price: "",
  image: "",
  category: "",
  availability: "Available on enquiry",
  label: "",
  imagePosition: "",
  galleryImages: [],
};

function AddProduct({ onProductAdded, editingProduct, onUpdate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [customCategory, setCustomCategory] = useState("");
  const [customWoodType, setCustomWoodType] = useState("");
  const [isOffer, setIsOffer] = useState(false);
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerText, setOfferText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewIsWide, setPreviewIsWide] = useState(false);
  const [offerExpires, setOfferExpires] = useState("");

  const finalCategory =
    form.category === "Other" ? customCategory : form.category;

  useEffect(() => {
    if (isOffer && form.price) {
      setOriginalPrice(form.price);
    }
  }, [isOffer, form.price]);

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    const normalizedWoodTypes = normalizeWoodTypes(editingProduct.woodType);
    const predefinedWoodTypes = normalizedWoodTypes.filter((item) =>
      WOOD_TYPE_OPTIONS.includes(item)
    );
    const customWoodTypeValue =
      normalizedWoodTypes.find((item) => !WOOD_TYPE_OPTIONS.includes(item)) || "";

    setForm({
      ...INITIAL_FORM,
      ...editingProduct,
      woodType: customWoodTypeValue
        ? [...predefinedWoodTypes, "Other"]
        : predefinedWoodTypes,
      availability:
        editingProduct.availability || INITIAL_FORM.availability,
      imagePosition: editingProduct.imagePosition || "",
      galleryImages: editingProduct.galleryImages || [],
    });

    setCustomCategory(
      editingProduct.category && !CATEGORY_OPTIONS.includes(editingProduct.category)
        ? editingProduct.category
        : ""
    );

    setCustomWoodType(
      customWoodTypeValue
    );

    if (editingProduct.offer?.isOffer) {
      setIsOffer(true);
      setOriginalPrice(editingProduct.offer.originalPrice || "");
      setOfferPrice(editingProduct.offer.offerPrice || "");
      setOfferText(editingProduct.offer.offerText || "");
      setOfferExpires(
        formatDateTimeLocalValue(editingProduct.offer.expiresAt)
      );
    } else {
      setIsOffer(false);
      setOriginalPrice("");
      setOfferPrice("");
      setOfferText("");
      setOfferExpires("");
    }
  }, [editingProduct]);

  useEffect(() => {
    if (!form.image) {
      setPreviewIsWide(false);
      return;
    }

    const img = new Image();
    img.src = form.image;

    img.onload = () => {
      setPreviewIsWide(img.width > img.height);
    };
  }, [form.image]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleWoodType = (woodType) => {
    setForm((prev) => {
      const exists = prev.woodType.includes(woodType);
      const nextWoodTypes = exists
        ? prev.woodType.filter((item) => item !== woodType)
        : [...prev.woodType, woodType];

      return {
        ...prev,
        woodType: nextWoodTypes,
      };
    });

    if (woodType === "Other" && form.woodType.includes("Other")) {
      setCustomWoodType("");
    }
  };

  const getFinalWoodTypes = () => {
    const selected = form.woodType.filter((item) => item !== "Other");

    if (form.woodType.includes("Other") && customWoodType.trim()) {
      selected.push(customWoodType.trim());
    }

    return selected;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setCustomCategory("");
    setCustomWoodType("");
    setIsOffer(false);
    setOriginalPrice("");
    setOfferPrice("");
    setOfferText("");
    setOfferExpires("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const finalWoodTypes = getFinalWoodTypes();

      if (!form.name || !form.price || !finalCategory) {
        alert("Please fill all required fields");
        return;
      }

      if (form.woodType.includes("Other") && !customWoodType.trim()) {
        alert("Please enter the other wood type");
        return;
      }

      const payload = {
        ...form,
        category: finalCategory,
        woodType: finalWoodTypes,
        price: Number(form.price),
      };
if (isOffer) {
  payload.offer = {
    isOffer: true,
    originalPrice: Number(originalPrice),
    offerPrice: Number(offerPrice),
    offerText,
    expiresAt: offerExpires ? new Date(offerExpires).toISOString() : null
  };
} else {
        payload.offer = null;
      }

      if (editingProduct) {
        await onUpdate(editingProduct._id, payload);
      } else {
        const data = await createProduct(payload);
        onProductAdded(data);
      }

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;

    if (!files.length) return;

    try {
      setUploading(true);

      const uploadedImages = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        uploadedImages.push(data.imageUrl);
      }

      setForm((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...uploadedImages],
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        image: data.imageUrl,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };



  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-8 max-w-4xl rounded-xl bg-white p-6 shadow-md"
    >
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the product details, then upload images and optional offer info.
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Basic Details
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />

            <div className="space-y-3">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Select Category</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {form.category === "Other" && (
                <input
                  placeholder="Enter new category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              )}
            </div>

            <div className="rounded-lg border px-3 py-3 md:col-span-2">
              <p className="mb-3 text-sm font-medium text-gray-700">Wood Type</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {WOOD_TYPE_OPTIONS.map((woodType) => (
                  <label key={woodType} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.woodType.includes(woodType)}
                      onChange={() => toggleWoodType(woodType)}
                    />
                    {woodType}
                  </label>
                ))}
              </div>

              {form.woodType.includes("Other") && (
                <input
                  placeholder="Enter other wood type"
                  value={customWoodType}
                  onChange={(e) => setCustomWoodType(e.target.value)}
                  className="mt-3 w-full rounded-lg border px-3 py-2"
                />
              )}
            </div>

            <input
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />

            <select
              name="availability"
              value={form.availability}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border px-3 py-2"
          />
        </section>

        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Display Settings
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              name="label"
              value={form.label}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">No Label</option>
              <option value="New">New Arrival</option>
              <option value="Offer">Offer</option>
              <option value="Best Seller">Best Seller</option>
            </select>

            <select
              name="imagePosition"
              value={form.imagePosition}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">No Image Focus</option>
              <option value="top">Image Focus: Top</option>
              <option value="center">Image Focus: Center</option>
            </select>
          </div>
        </section>

        <section className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Images
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-dashed p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Main Image</p>
              <input
                type="file"
                onChange={handleImageUpload}
                className="w-full text-sm"
              />
              {uploading && (
                <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
              )}
              {form.image && (
                <div className="mt-4 max-w-[280px] overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div
                    className={`w-full overflow-hidden bg-gray-100 ${
                      previewIsWide ? "aspect-[16/9]" : "aspect-[4/5]"
                    }`}
                  >
                    <img
                      src={form.image}
                      alt="preview"
                      className={`h-full w-full object-cover ${
                        form.imagePosition === "top" ? "object-top" : "object-center"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {form.name || "Product Name Preview"}
                    </p>
                    <p className="line-clamp-2 text-xs text-gray-500">
                      {form.description || "This is how the image will look inside the product card."}
                    </p>
                    <p className="text-xs text-gray-400">
                      Wood: {getFinalWoodTypes().join(", ") || "Wood Type"}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {form.price ? `?${form.price}` : "?0"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Gallery Images
              </p>
              <input
                type="file"
                multiple
                onChange={handleGalleryUpload}
                className="w-full text-sm"
              />

              {form.galleryImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {form.galleryImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img}
                        alt="gallery"
                        className="h-20 w-20 rounded-lg object-cover shadow"
                      />

                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t pt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={isOffer}
              onChange={(e) => setIsOffer(e.target.checked)}
            />
            Enable Offer
          </label>

          {isOffer && (
            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-3">
              <input
                type="number"
                placeholder="Original Price"
                className="w-full rounded-lg border px-3 py-2"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />

              <input
                type="number"
                placeholder="Offer Price"
                className="w-full rounded-lg border px-3 py-2"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />

              <input
                type="text"
                placeholder="Offer Text (optional)"
                className="w-full rounded-lg border px-3 py-2"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Offer Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={offerExpires}
                  onChange={(e) => setOfferExpires(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
                <p className="text-xs text-gray-500">
                  Leave empty if this offer should not expire automatically.
                </p>
              </div>
            </div>
          )}

          {originalPrice > 0 && offerPrice > 0 && (
            <p className="text-sm text-green-600">
              Discount: {Math.round(((originalPrice - offerPrice) / originalPrice) * 100)}%
            </p>
          )}
        </section>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="mt-6 w-full rounded-lg bg-black py-3 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {uploading
          ? "Uploading Image..."
          : editingProduct
          ? "Update Product"
          : "Add Product"}
      </button>
    </form>
  );
}

export default AddProduct;

