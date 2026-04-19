import { useEffect, useRef, useState } from "react";
import { createProduct } from "../services/productService";
import { normalizeWoodTypes, WOOD_TYPE_OPTIONS } from "../utils/productUtils";
import { API_URL } from "../config";
import { authenticatedFetch, SESSION_EXPIRED_MESSAGE } from "../utils/api";
import useSessionInterruptionMessage from "../hooks/useSessionInterruptionMessage";

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
    date.getDate(),
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
  const [submitting, setSubmitting] = useState(false);
  const mainImageInputRef = useRef(null);
const galleryInputRef = useRef(null);
  const [removingMainImage, setRemovingMainImage] = useState(false);
  const [removingGalleryIndex, setRemovingGalleryIndex] = useState(null);
  
  const { message: sessionMessage, clearMessage } =
    useSessionInterruptionMessage();
  const persistedImageUrlsRef = useRef(new Set());

  const finalCategory =
    form.category === "Other" ? customCategory : form.category;
  useEffect(() => {
    if (isOffer && form.price) {
      setOriginalPrice(form.price);
    }
  }, [isOffer, form.price]);

  useEffect(() => {
    if (!editingProduct) {
      persistedImageUrlsRef.current = new Set();
      return;
    }

    const normalizedWoodTypes = normalizeWoodTypes(editingProduct.woodType);
    const predefinedWoodTypes = normalizedWoodTypes.filter((item) =>
      WOOD_TYPE_OPTIONS.includes(item),
    );
    const customWoodTypeValue =
      normalizedWoodTypes.find((item) => !WOOD_TYPE_OPTIONS.includes(item)) ||
      "";

    setForm({
      ...INITIAL_FORM,
      ...editingProduct,
      woodType: customWoodTypeValue
        ? [...predefinedWoodTypes, "Other"]
        : predefinedWoodTypes,
      availability: editingProduct.availability || INITIAL_FORM.availability,
      imagePosition: editingProduct.imagePosition || "",
      galleryImages: editingProduct.galleryImages || [],
    });

    setCustomCategory(
      editingProduct.category &&
        !CATEGORY_OPTIONS.includes(editingProduct.category)
        ? editingProduct.category
        : "",
    );

    setCustomWoodType(customWoodTypeValue);

    if (editingProduct.offer?.isOffer) {
      setIsOffer(true);
      setOriginalPrice(editingProduct.offer.originalPrice || "");
      setOfferPrice(editingProduct.offer.offerPrice || "");
      setOfferText(editingProduct.offer.offerText || "");
      setOfferExpires(formatDateTimeLocalValue(editingProduct.offer.expiresAt));
    } else {
      setIsOffer(false);
      setOriginalPrice("");
      setOfferPrice("");
      setOfferText("");
      setOfferExpires("");
    }

    persistedImageUrlsRef.current = new Set(
      [
        editingProduct.image,
        ...(Array.isArray(editingProduct.galleryImages)
          ? editingProduct.galleryImages
          : []),
      ].filter(Boolean),
    );
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

  if (mainImageInputRef.current) {
    mainImageInputRef.current.value = "";
  }

  if (galleryInputRef.current) {
    galleryInputRef.current.value = "";
  }
};

  const isPersistedImage = (imageUrl) =>
    persistedImageUrlsRef.current.has(imageUrl);

  const deleteUploadedImage = async (imageUrl) => {
    const res = await authenticatedFetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to remove image");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (submitting) return;

  

  try {
      const finalWoodTypes = getFinalWoodTypes();

      if (!form.name.trim() || form.price === "" || !finalCategory?.trim()) {
        alert("Please fill all required fields");
        return;
      }

      if (!form.image) {
        alert("Main photo is required");
        return;
      }

      if (form.woodType.includes("Other") && !customWoodType.trim()) {
        alert("Please enter the other wood type");
        return;
      }


      setSubmitting(true);


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
          expiresAt: offerExpires ? new Date(offerExpires).toISOString() : null,
        };
      } else {
        payload.offer = null;
      }

      if (editingProduct) {
        await onUpdate(editingProduct._id, payload);
      } else {
     const data = await createProduct(payload);
console.log(data);

onProductAdded(data.product || data);
      }

      resetForm();
    } catch (error) {
    console.error(error);
    if (error.message !== SESSION_EXPIRED_MESSAGE) {
      alert(error.message || "Failed to add product");
    }
  } finally {
    setSubmitting(false);
  }
};

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;

    if (!files.length) return;
const basicsReady =
  form.name.trim() &&
  Number(form.price) > 0 &&
  finalCategory?.trim();

if (!basicsReady || !form.image) {
  alert("Please complete Product Name, Price, Category and Main Photo before uploading gallery images");

  if (galleryInputRef.current) {
    galleryInputRef.current.value = "";
  }

  return;
}
    try {
      setUploading(true);

      const uploadedImages = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`${API_URL}/api/upload`, {
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
  const basicsReady =
  form.name.trim() &&
  Number(form.price) > 0 &&
  finalCategory?.trim();

if (!basicsReady) {
  alert("Please enter Product Name, Price and Category before uploading main photo");

  if (mainImageInputRef.current) {
    mainImageInputRef.current.value = "";
  }

  return;
}

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (form.image && !isPersistedImage(form.image)) {
        try {
          await deleteUploadedImage(form.image);
        } catch (error) {
          console.error("Failed to cleanup previous main image", error);
        }
      }

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

  const removeMainImage = async () => {
    if (!form.image || removingMainImage) {
      return;
    }

    try {
      setRemovingMainImage(true);

      if (!isPersistedImage(form.image)) {
        await deleteUploadedImage(form.image);
      }

      setForm((prev) => ({
        ...prev,
        image: "",
      }));
    } catch (error) {
      console.error(error);
      if (error.message !== SESSION_EXPIRED_MESSAGE) {
        alert(error.message || "Failed to remove image");
      }
    } finally {
      setRemovingMainImage(false);
    }
  };

  const removeGalleryImage = async (index) => {
    if (removingGalleryIndex !== null) {
      return;
    }

    const imageUrl = form.galleryImages[index];

    if (!imageUrl) {
      return;
    }

    try {
      setRemovingGalleryIndex(index);

      if (!isPersistedImage(imageUrl)) {
        await deleteUploadedImage(imageUrl);
      }

      setForm((prev) => ({
        ...prev,
        galleryImages: prev.galleryImages.filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error(error);
      if (error.message !== SESSION_EXPIRED_MESSAGE) {
        alert(error.message || "Failed to remove gallery image");
      }
    } finally {
      setRemovingGalleryIndex(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-8 max-w-4xl rounded-xl bg-white p-6 shadow-md"
    >
      {sessionMessage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {sessionMessage}
        </div>
      )}

      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the product details, then upload images and optional offer
          info.
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
              onFocus={clearMessage}
              required
              className="w-full rounded-lg border px-3 py-2"
            />

            <div className="space-y-3">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                onFocus={clearMessage}
                required
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
                  onFocus={clearMessage}
                  className="w-full rounded-lg border px-3 py-2"
                />
              )}
            </div>

            <div className="rounded-lg border px-3 py-3 md:col-span-2">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Wood Type
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {WOOD_TYPE_OPTIONS.map((woodType) => (
                  <label
                    key={woodType}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
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
                  onFocus={clearMessage}
                  className="mt-3 w-full rounded-lg border px-3 py-2"
                />
              )}
            </div>

            <input
              name="price"
              type="number"
              min="0"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              onFocus={clearMessage}
              required
              className="w-full rounded-lg border px-3 py-2"
            />

            <select
              name="availability"
              value={form.availability}
              onChange={handleChange}
              onFocus={clearMessage}
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
            onFocus={clearMessage}
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
              onFocus={clearMessage}
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
              onFocus={clearMessage}
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
              <p className="mb-2 text-sm font-medium text-gray-700">
                Main Image
              </p>
              <input
  ref={mainImageInputRef}
  type="file"
                onChange={handleImageUpload}
                disabled={submitting || removingMainImage}
                accept="image/*"
                required={!editingProduct}
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
                        form.imagePosition === "top"
                          ? "object-top"
                          : "object-center"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {form.name || "Product Name Preview"}
                    </p>
                    <p className="line-clamp-2 text-xs text-gray-500">
                      {form.description ||
                        "This is how the image will look inside the product card."}
                    </p>
                    <p className="text-xs text-gray-400">
                      Wood: {getFinalWoodTypes().join(", ") || "Wood Type"}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {form.price ? `?${form.price}` : "?0"}
                    </p>
                    <button
                      type="button"
                      onClick={removeMainImage}
                      disabled={submitting || removingMainImage}
                      className="mt-2 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingMainImage ? "Removing..." : "Remove Main Image"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Gallery Images
              </p>
            <input
  ref={galleryInputRef}
  type="file"
  multiple
                onChange={handleGalleryUpload}
                disabled={submitting || removingGalleryIndex !== null}
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
                        disabled={submitting || removingGalleryIndex !== null}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                      >
                        {removingGalleryIndex === i ? "..." : "x"}
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
                onFocus={clearMessage}
              />

              <input
                type="number"
                placeholder="Offer Price"
                className="w-full rounded-lg border px-3 py-2"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                onFocus={clearMessage}
              />

              <input
                type="text"
                placeholder="Offer Text (optional)"
                className="w-full rounded-lg border px-3 py-2"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                onFocus={clearMessage}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Offer Expiry Date
                </label>
                <input
                  type="datetime-local"
                  value={offerExpires}
                  onChange={(e) => setOfferExpires(e.target.value)}
                  onFocus={clearMessage}
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
              Discount:{" "}
              {Math.round(((originalPrice - offerPrice) / originalPrice) * 100)}
              %
            </p>
          )}
        </section>
      </div>

      <button
        type="submit"
       disabled={uploading || submitting}
        className="mt-6 w-full rounded-lg bg-black py-3 text-white hover:bg-gray-800 disabled:opacity-50"
      >
       {submitting
  ? editingProduct
    ? "Updating Product..."
    : "Adding Product..."
  : uploading
    ? "Uploading Image..."
    : editingProduct
      ? "Update Product"
      : "Add Product"}
      </button>
    </form>
  );
}

export default AddProduct;
