import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatWoodTypes, normalizeWoodTypes } from "../utils/productUtils";

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
  return values.find((item) => item.value.toLowerCase().includes(query)) || null;
};

function ProductCard({
  product,
  onDelete,
  onEdit,
  isLoggedIn,
  phoneNumber,
  searchQuery = "",
  searchType = "all",
}) {
const finalPrice = product.offer?.isOffer
  ? product.offer.offerPrice
  : product.price;
const woodTypeLabel = formatWoodTypes(product.woodType);
const searchMatch = getSearchMatch(product, searchQuery, searchType);


  
const message = `
Hi,

I'm interested in this product:

- Name: ${product.name}
- Price: ₹${finalPrice}
${product.offer?.isOffer ? `- Original Price: ₹${product.offer.originalPrice}` : ""}
- Wood Type: ${woodTypeLabel}

Image: ${product.image}

Link:
${window.location.origin}/product/${product._id}
`;
  const [isWide, setIsWide] = useState(false);
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const navigate = useNavigate();


  useEffect(() => {
  const img = new Image();
  img.src = product.image;

  img.onload = () => {
    if (img.width > img.height) {
      setIsWide(true);   // landscape
    } else {
      setIsWide(false);  // portrait
    }
  };
}, [product.image]);

  return (
   <div
 
   
   className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group">

      {/* IMAGE */}
  <div
    onClick={() => navigate(`/product/${product._id}`)}
   className="relative overflow-hidden">
  
  <div
    className={`w-full overflow-hidden bg-gray-100
      ${isWide ? "aspect-[16/9]" : "aspect-[4/5]"}`}
  >
  {product.offer?.isOffer && (
  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
  {Math.round(
  ((product.offer.originalPrice - product.offer.offerPrice) /
    product.offer.originalPrice) * 100
)}% OFF
  </span>
)}

  <img
  src={product.image}
  alt={product.name}
  className={`w-full h-full object-cover
    ${product.imagePosition === "top" ? "object-top" : "object-center"}
    group-hover:scale-105 transition duration-300`}
/>

{product.offer?.isOffer &&
  (product.offer?.offerText || (
    <>
      {Math.round(
        ((product.offer.originalPrice - product.offer.offerPrice) /
          product.offer.originalPrice) * 100
      )}% OFF
    </>
  ))}
  </div>
  {product.label && (
    <span className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full text-white
      ${product.label === "Offer" ? "bg-red-500" :
        product.label === "New" ? "bg-green-500" :
        product.label === "Best Seller" ? "bg-blue-500" :
        "bg-yellow-500 text-black"}`}>
      {product.label}
    </span>
  )}
</div>

      {/* CONTENT */}
      <div className="p-4">

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-800">
          {searchMatch?.label === "Product"
            ? highlightText(product.name, searchQuery)
            : product.name}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {product.description}
        </p>

        {searchMatch && (
          <p className="mt-2 text-xs font-medium text-amber-700">
            Matched in {searchMatch.label}: {highlightText(searchMatch.value, searchQuery)}
          </p>
        )}

        {/* WOOD TYPE */}
        <p className="text-xs text-gray-400 mt-2">
          Wood:{" "}
          {searchMatch?.label === "Wood Type"
            ? highlightText(searchMatch.value, searchQuery)
            : woodTypeLabel}
        </p>

        {/* PRICE */}
       <div className="mt-2">

  {product.offer?.isOffer ? (
    <div>

      {/* OFFER PRICE */}
      <p className="text-xl font-bold text-green-600">
        ₹{product.offer.offerPrice}
      </p>

      {/* ORIGINAL PRICE */}
      <p className="text-sm text-gray-400 line-through">
        ₹{product.offer.originalPrice}
      </p>

    </div>
  ) : (
    <p className="text-xl font-bold text-green-600">
      ₹{product.price}
    </p>
  )}

</div>

        {/* BUTTON */}
        <a
  onClick={(e) => e.stopPropagation()}
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          💬 Enquire on WhatsApp
        </a>

        {/* ADMIN ACTIONS */}
        {isLoggedIn && (
          <div className="flex justify-between mt-3 text-sm">
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
