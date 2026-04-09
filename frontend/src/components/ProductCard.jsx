import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatWoodTypes, normalizeWoodTypes } from "../utils/productUtils";

const OFFER_GRACE_PERIOD_MS = 60 * 60 * 1000;

const highlightText = (text, query) => {
  if (!text || !query?.trim()) {
    return text;
  }

  const normalizedQuery = query.trim();
  const lowerText = text.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return text;
  }

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
  const after = text.slice(matchIndex + normalizedQuery.length);

  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200 px-1 text-inherit">{match}</mark>
      {after}
    </>
  );
};

const getSearchMatch = (product, searchQuery, searchType) => {
  const query = searchQuery?.trim().toLowerCase();

  if (!query) {
    return null;
  }

  const checks = {
    product: [{ label: "Product", value: product.name || "" }],
    category: [{ label: "Category", value: product.category || "" }],
    woodType: normalizeWoodTypes(product.woodType).map((item) => ({
      label: "Wood Type",
      value: item,
    })),
    all: [
      { label: "Product", value: product.name || "" },
      { label: "Category", value: product.category || "" },
      ...normalizeWoodTypes(product.woodType).map((item) => ({
        label: "Wood Type",
        value: item,
      })),
    ],
  };

  const values = checks[searchType] || checks.all;
  return (
    values.find((item) => item.value.toLowerCase().includes(query)) || null
  );
};

function ProductCard({
  product,
  onDelete,
  onEdit,
  isLoggedIn,
  phoneNumber,
  searchQuery = "",
  searchType = "all",
  wishlist,
  toggleWishlist,
  addToCart  
  
}) {
  const [now, setNow] = useState(() => Date.now());
  const [isWide, setIsWide] = useState(false);
  const navigate = useNavigate();

  const offerExpiryTime = product.offer?.expiresAt
    ? new Date(product.offer.expiresAt).getTime()
    : null;
  const isOfferArchived =
    offerExpiryTime && !Number.isNaN(offerExpiryTime)
      ? now >= offerExpiryTime + OFFER_GRACE_PERIOD_MS
      : false;
  const shouldShowOffer = Boolean(product.offer?.isOffer && !isOfferArchived);
  const shouldShowLabel = Boolean(
    product.label && !(product.label === "Offer" && !shouldShowOffer),
  );
  const finalPrice = shouldShowOffer ? product.offer.offerPrice : product.price;
  const woodTypeLabel = formatWoodTypes(product.woodType);
  const searchMatch = getSearchMatch(product, searchQuery, searchType);
  const isLiked = wishlist?.some((p) => p._id === product._id) || false;

  const message = [
    "Hi,",
    "Product enquiry",
    "--------------------",
    "Details:",
    `Name: ${product.name}`,
    `Price: Rs.${finalPrice}`,
    shouldShowOffer ? `Original Price: Rs.${product.offer.originalPrice}` : null,
    "--------------------",
    "Links:",
    `Image:`,
    product.image,
    "--------------------",
    `Product Link:`,
    `${window.location.origin}/product/${product._id}`,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const img = new Image();
    img.src = product.image;

    img.onload = () => {
      setIsWide(img.width > img.height);
    };
  }, [product.image]);

  useEffect(() => {
    if (!product.offer?.expiresAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, [product.offer?.expiresAt]);

  const discountPercent = shouldShowOffer
    ? Math.round(
        ((product.offer.originalPrice - product.offer.offerPrice) /
          product.offer.originalPrice) *
          100,
      )
    : 0;

  const labelClassName =
    product.label === "Offer"
      ? "bg-red-500"
      : product.label === "New"
        ? "bg-green-500"
        : product.label === "Best Seller"
          ? "bg-blue-500"
          : "bg-yellow-500 text-black";

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:shadow-xl">
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="relative cursor-pointer overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            {shouldShowLabel && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm ${labelClassName}`}
              >
                {product.label}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {shouldShowOffer && (
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`pointer-events-auto flex h-10 min-w-10 items-center justify-center rounded-full px-3 shadow-md transition ${
                isLiked ? "bg-red-500 text-white" : "bg-white/90 text-gray-900"
              }`}
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isLiked ? "\u2665" : "\u2661"}
            </button>
          </div>
        </div>

        <div
          className={`w-full overflow-hidden bg-gray-100 ${
            isWide ? "aspect-[16/9]" : "aspect-[4/5]"
          }`}
        >
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
              product.imagePosition === "top" ? "object-top" : "object-center"
            }`}
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {searchMatch?.label === "Product"
            ? highlightText(product.name, searchQuery)
            : product.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {product.description}
        </p>

        {searchMatch && (
          <p className="mt-2 text-xs font-medium text-amber-700">
            Matched in {searchMatch.label}:{" "}
            {highlightText(searchMatch.value, searchQuery)}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-400">
          Wood:{" "}
          {searchMatch?.label === "Wood Type"
            ? highlightText(searchMatch.value, searchQuery)
            : woodTypeLabel}
        </p>

        {shouldShowOffer && product.offer?.offerText && (
          <p className="mt-2 text-xs font-medium text-red-500">
            {product.offer.offerText}
          </p>
        )}

        <div className="mt-2">
          {shouldShowOffer ? (
            <div>
              <p className="text-xl font-bold text-green-600">
                Rs.{product.offer.offerPrice}
              </p>
              <p className="text-sm text-gray-400 line-through">
                Rs.{product.offer.originalPrice}
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-green-600">Rs.{product.price}</p>
          )}
        </div>

        <a
          onClick={(e) => e.stopPropagation()}
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-lg bg-green-500 py-2 text-center text-white transition hover:bg-green-600"
        >
          Enquire on WhatsApp
        </a>
     <button
  onClick={(e) => {
    e.stopPropagation();
    addToCart?.(product);   // ✅ safe call
  }}
  className="mt-2 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
>
  🛒 Add to Cart
</button>

        {isLoggedIn && (
          <div className="mt-3 flex justify-between text-sm">
            <button
              onClick={() => onEdit(product)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(product._id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
