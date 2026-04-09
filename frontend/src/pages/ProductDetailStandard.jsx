import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProductById, getProducts } from "../services/productService";
import { getSettings } from "../services/settingsService";
import { formatWoodTypes } from "../utils/productUtils";

const formatPrice = (value) => `Rs.${value}`;
const OFFER_GRACE_PERIOD_MS = 60 * 60 * 1000;

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
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const thumbnailScrollerRef = useRef(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, settingsData] = await Promise.all([
          getProductById(id),
          getSettings(),
        ]);

        if (!productData?._id) {
          setLoadError(productData?.message || "Product not found.");
          setProduct(null);
          return;
        }

        setLoadError("");
        setProduct(productData);
        setSelectedImage(productData.image || null);
        setPhone(settingsData?.phone || "");
      } catch (error) {
        console.error(error);
        setLoadError("Unable to load this product right now.");
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const allProducts = await getProducts();
        const filtered = allProducts
          .filter(
            (item) =>
              item.category === product.category && item._id !== product._id,
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

  useEffect(() => {
    if (!product?.offer?.expiresAt) {
      return;
    }
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return [product.image, ...(product.galleryImages || [])].filter(
      (image, index, array) => image && array.indexOf(image) === index,
    );
  }, [product]);

  if (!product) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">{loadError || "Loading product..."}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 rounded-xl bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  const offerExpiryTime = product.offer?.expiresAt
    ? new Date(product.offer.expiresAt).getTime()
    : null;
  const timeLeft =
    offerExpiryTime && !Number.isNaN(offerExpiryTime)
      ? (() => {
          const diff = offerExpiryTime - now;

          if (diff <= -OFFER_GRACE_PERIOD_MS) {
            return "";
          }

          if (diff <= 0) {
            return "Expired";
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          const parts = [];

          if (days > 0) {
            parts.push(`${days}d`);
          }

          parts.push(`${hours}h`, `${minutes}m`, `${seconds}s`);
          return parts.join(" ");
        })()
      : "";
  const isOfferArchived =
    offerExpiryTime && !Number.isNaN(offerExpiryTime)
      ? now >= offerExpiryTime + OFFER_GRACE_PERIOD_MS
      : false;
  const currentImageIndex = Math.max(
    galleryImages.indexOf(selectedImage || product.image),
    0,
  );
  const shouldShowOffer = Boolean(product.offer?.isOffer && !isOfferArchived);
  const shouldShowLabel = Boolean(
    product.label && !(product.label === "Offer" && !shouldShowOffer),
  );
  const finalPrice = shouldShowOffer ? product.offer.offerPrice : product.price;
  const originalPrice = shouldShowOffer ? product.offer.originalPrice : null;
  const discountPercent = getDiscountPercent(originalPrice, finalPrice);
  const savings =
    originalPrice && finalPrice ? Math.max(originalPrice - finalPrice, 0) : 0;
  const woodTypeLabel = formatWoodTypes(product.woodType);
  const availabilityLabel = product.availability || "Available on enquiry";
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
    enquiryMessage,
  )}`;

  const scrollThumbnailStrip = (direction) => {
    const container = thumbnailScrollerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction * 220,
      behavior: "smooth",
    });
  };

  const selectImageByIndex = (index) => {
    const nextImage = galleryImages[index];

    if (!nextImage) {
      return;
    }

    setSelectedImage(nextImage);
    const thumbnail = thumbnailScrollerRef.current?.children?.[index];
    thumbnail?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const moveImageSelection = (direction) => {
    if (galleryImages.length <= 1) {
      return;
    }

    const nextIndex =
      (currentImageIndex + direction + galleryImages.length) %
      galleryImages.length;

    selectImageByIndex(nextIndex);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#f3f4f6_45%,_#e5e7eb)] px-4 py-8 md:py-10">
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

        <div className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur md:grid-cols-[1.05fr_0.95fr] md:p-8">
          <section>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-gray-200 bg-[linear-gradient(135deg,#fafaf9,#f3f4f6)] p-3 shadow-inner">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex h-[320px] w-full items-center justify-center rounded-[1.25rem] bg-white md:h-[520px]"
              >
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </button>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveImageSelection(-1)}
                    className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-gray-800 shadow-md transition hover:bg-white"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImageSelection(1)}
                    className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-gray-800 shadow-md transition hover:bg-white"
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-5 rounded-2xl border border-gray-200 bg-white/80 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-500">
                    Product Gallery
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveImageSelection(-1)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                      {"<"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImageSelection(1)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
                    >
                      {">"}
                    </button>
                  </div>
                </div>
                <div
                  ref={thumbnailScrollerRef}
                  className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {galleryImages.map((image) => {
                    const isActive = selectedImage === image;

                    return (
                      <button
                        key={image}
                        type="button"
                        onClick={() =>
                          selectImageByIndex(galleryImages.indexOf(image))
                        }
                        className={`shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                          isActive
                            ? "scale-105 border-black shadow-md"
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
                {shouldShowLabel && (
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

              <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-end gap-3">
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

              {shouldShowOffer && timeLeft ? (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm">
                  <p className="font-medium text-red-600">Limited Time Offer</p>
                  <p className="mt-1 text-gray-700">
                    {timeLeft === "Expired"
                      ? "Offer expired"
                      : `Ends in: ${timeLeft}`}
                  </p>
                </div>
              ) : null}

              {shouldShowOffer && product.offer?.offerText ? (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {product.offer.offerText}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 border-b border-gray-200 py-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 px-4 py-4">
                <p className="text-sm text-gray-500">Wood Type</p>
                <p className="mt-1 font-medium text-gray-900">
                  {woodTypeLabel}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-4">
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
                {product.description ||
                  "No description added for this product yet."}
              </p>
            </div>

            <div className="mt-auto pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700"
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
