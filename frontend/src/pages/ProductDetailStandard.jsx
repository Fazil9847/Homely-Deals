import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProductById, getProducts } from "../services/productService";
import { getSettings } from "../services/settingsService";
import { formatWoodTypes } from "../utils/productUtils";

const formatPrice = (value) => `Rs.${value}`;

const getDiscountPercent = (originalPrice, offerPrice) => {
  if (!originalPrice || !offerPrice) {
    return null;
  }

  return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
};

function ProductDetailStandard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [phone, setPhone] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, settingsData] = await Promise.all([
          getProductById(id),
          getSettings(),
        ]);

        setProduct(productData);
        setPhone(settingsData?.phone || "");
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const allProducts = await getProducts();
        const filtered = allProducts
          .filter(
            (item) =>
              item.category === product.category && item._id !== product._id
          )
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (error) {
        console.error(error);
      }
    };

    if (product) {
      loadRelated();
    }
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return [product.image, ...(product.galleryImages || [])].filter(
      (image, index, array) => image && array.indexOf(image) === index
    );
  }, [product]);

  if (!product) {
    return <p className="mt-10 text-center text-gray-500">Loading product...</p>;
  }

  const finalPrice = product.offer?.isOffer
    ? product.offer.offerPrice
    : product.price;
  const originalPrice = product.offer?.isOffer
    ? product.offer.originalPrice
    : null;
  const discountPercent = getDiscountPercent(originalPrice, finalPrice);
  const savings =
    originalPrice && finalPrice ? Math.max(originalPrice - finalPrice, 0) : 0;
  const woodTypeLabel = formatWoodTypes(product.woodType);
  const availabilityLabel =
    product.availability || "Available on enquiry";
  const enquiryMessage = [
    "Hi,",
    "",
    "I'm interested in this product:",
    `Name: ${product.name}`,
    `Price: ${formatPrice(finalPrice)}`,
    originalPrice ? `Original Price: ${formatPrice(originalPrice)}` : null,
    `Wood Type: ${woodTypeLabel}`,
    `Link: ${window.location.origin}/product/${product._id}`,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    enquiryMessage
  )}`;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="transition hover:text-black"
          >
            Back
          </button>
          <span>/</span>
          <span>{product.category || "Products"}</span>
          <span>/</span>
          <span className="truncate text-gray-700">{product.name}</span>
        </div>

        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-[1.05fr_0.95fr] md:p-8">
          <section>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex h-[320px] w-full items-center justify-center md:h-[520px]"
              >
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </button>
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {galleryImages.map((image) => {
                  const isActive = selectedImage === image;

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-xl border-2 bg-white transition ${
                        isActive
                          ? "border-black"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={product.name}
                        className="h-20 w-20 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col">
            <div className="border-b border-gray-200 pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.category && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
                    {product.category}
                  </span>
                )}
                {product.label && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                    {product.label}
                  </span>
                )}
                {discountPercent ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-red-600">
                    {discountPercent}% off
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-3xl font-bold text-gray-900 md:text-4xl">
                  {formatPrice(finalPrice)}
                </span>
                {originalPrice ? (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                ) : null}
              </div>

              {originalPrice ? (
                <p className="mt-2 text-sm text-green-700">
                  You save {formatPrice(savings)}
                </p>
              ) : null}

              {product.offer?.offerText ? (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {product.offer.offerText}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 border-b border-gray-200 py-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Wood Type</p>
                <p className="mt-1 font-medium text-gray-900">{woodTypeLabel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="mt-1 font-medium text-gray-900">
                  {availabilityLabel}
                </p>
              </div>
            </div>

            <div className="py-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Description
              </h2>
              <p className="mt-3 leading-7 text-gray-700">
                {product.description || "No description added for this product yet."}
              </p>
            </div>

            <div className="mt-auto pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-base font-medium text-white transition hover:bg-green-700"
              >
                Enquire on WhatsApp
              </a>
            </div>
          </section>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Related Products
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                More options from the same category.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item._id}
                  product={item}
                  isLoggedIn={false}
                  phoneNumber={phone}
                />
              ))}
            </div>
          </section>
        )}

        {showPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowPreview(false);
              }
            }}
          >
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1 text-2xl text-white transition hover:bg-white/20"
            >
              x
            </button>
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="max-h-[92vh] max-w-[92vw] object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailStandard;
