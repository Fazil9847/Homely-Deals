import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById } from "../services/productService";
import { getSettings } from "../services/settingsService";
import { getProducts } from "../services/productService";
import { formatWoodTypes } from "../utils/productUtils";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
   const [relatedProducts, setRelatedProducts] = useState([]);

  const [product, setProduct] = useState(null);
  const [phone, setPhone] = useState("");
 const [timeLeft, setTimeLeft] = useState("Calculating...");
const isExpired =
  product?.offer?.expiresAt &&
  new Date(product.offer.expiresAt) < new Date();

  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await getProductById(id);
        const settingsData = await getSettings();

        setProduct(productData);
        setPhone(settingsData?.phone);
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
        .filter(p => 
          p.category === product.category && p._id !== product._id
        )
        .slice(0, 4); // limit

      setRelatedProducts(filtered);
    } catch (error) {
      console.error(error);
    }
  };


  if (product) {
    loadRelated();
  }
}, [product]);
 if (!product) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  

  useEffect(() => {
  if (!product?.offer?.expiresAt) return;

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const expiry = new Date(product.offer.expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      setTimeLeft("Expired");
      clearInterval(interval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    let timeString = `${hours}h ${minutes}m ${seconds}s`;

    if (diff < 3600000) {
      timeString = `⚠️ ${timeString}`;
    }

    setTimeLeft(timeString);
  }, 1000);

  return () => clearInterval(interval);
}, [product]);

const finalPrice = product.offer?.isOffer
  ? product.offer.offerPrice
  : product.price;

const message = `
Hi,

I'm interested in this product:

- Name: ${product.name}
- Price: ₹${finalPrice}
${product.offer?.isOffer ? `- Original Price: ₹${product.offer.originalPrice}` : ""}
- Wood Type: ${formatWoodTypes(product.woodType)}

Image: ${product.image}

Link:
${window.location.origin}/product/${product._id}
`;
  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-6xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-500 hover:text-black transition"
        >
          ← Back
        </button>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 grid md:grid-cols-2 gap-10 items-center">
<div>

  {/* MAIN IMAGE */}
  <div className="h-[450px] bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">

    <img
  src={selectedImage}
  alt="product"
  onClick={() => setShowPreview(true)}
  className="max-h-full object-contain cursor-zoom-in"
/>
  </div>

  {/* THUMBNAILS */}
  <div className="flex gap-3 mt-4 flex-wrap">

    {/* MAIN IMAGE */}
    <img
      src={product.image}
      onClick={() => setSelectedImage(product.image)}
      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
        selectedImage === product.image
          ? "border-black"
          : "border-gray-300"
      }`}
    />

    {/* GALLERY IMAGES */}
    {product.galleryImages?.map((img, i) => (
      <img
        key={i}
        src={img}
        onClick={() => setSelectedImage(img)}
        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
          selectedImage === img
            ? "border-black"
            : "border-gray-300"
        }`}
      />
    ))}

  </div>

</div>
          {/* DETAILS */}
          <div className="flex flex-col gap-4 h-full">
                {product.label && (
  <span className={`w-fit mb-3 text-xs px-3 py-1 rounded-full
  ${product.label === "Offer" ? "bg-red-100 text-red-600" :
    product.label === "New" ? "bg-green-100 text-green-600" :
    product.label === "Best Seller" ? "bg-blue-100 text-blue-600" :
    "bg-yellow-100 text-yellow-800"}`}>
  {product.label}
</span>
)}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                {product.name}
              </h1>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Wood Type
                </p>
                <p className="text-lg font-medium text-gray-700">
                  {formatWoodTypes(product.woodType)}
                </p>
              </div>
{product.offer?.isOffer ? (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">

    {/* TOP LINE */}
   <p className="text-red-600 font-semibold mb-2 text-sm">
  🔥 Limited Time Offer
</p>

<p className="text-sm text-gray-600 mb-2">
  ⏳ Ends in:
  <span className="ml-1 font-semibold text-red-500">
    {timeLeft}
  </span>
</p>
{timeLeft === "Expired" ? (
  <p className="text-sm text-gray-400">Offer expired</p>
) : (
  <p className="text-sm text-gray-600 mb-2">
    ⏳ Ends in:
    <span className="ml-1 font-semibold text-red-500">
      {timeLeft}
    </span>
  </p>
)}

    {/* PRICE */}
    <div className="flex items-center gap-4 mb-2">

      <span className="text-3xl font-bold text-green-600">
        ₹{product.offer.offerPrice}
      </span>

      <span className="text-gray-400 line-through text-lg">
        ₹{product.offer.originalPrice}
      </span>

     {product.offer?.originalPrice && product.offer?.offerPrice && (
  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
    {Math.round(
      ((product.offer.originalPrice - product.offer.offerPrice) /
        product.offer.originalPrice) * 100
    )}% OFF
  </span>
)}

    </div>

    {/* SAVE TEXT */}
    <p className="text-sm text-gray-600">
      You save ₹
      {product.offer.originalPrice - product.offer.offerPrice}
    </p>

    {/* OPTIONAL TEXT */}
    {product.offer.offerText && (
      <p className="text-xs text-red-500 mt-1">
        {product.offer.offerText}
      </p>
    )}

  </div>
) : (
  <p className="text-3xl font-bold text-green-600 mb-6">
    ₹{product.price}
  </p>
)}
            </div>

            {/* BUTTON */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl text-lg font-medium hover:bg-green-600 hover:scale-[1.02] transition"
            >
              💬 Enquire on WhatsApp
            </a>

          </div>
        </div>
             

     {relatedProducts.length > 0 && (
  <div className="mt-16">

    <h2 className="text-2xl font-semibold mb-6">
      Related Products
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

      {relatedProducts.map((item) => (
        <div
          key={item._id}
         onClick={() => {
  navigate(`/product/${item._id}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
          className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
        >

          <div className="h-40 bg-gray-100 overflow-hidden rounded-t-xl">
            <img
              src={item.image}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-3">
            <h3 className="text-sm font-medium line-clamp-1">
              {item.name}
            </h3>

            <p className="text-green-600 font-bold text-sm">
              ₹{item.price}
            </p>
          </div>

        </div>
      ))}

    </div>
  </div>
)}


        
        {showPreview && (
  <div
    className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
   onClick={(e) => {
  if (e.target === e.currentTarget) {
    setShowPreview(false);
  }
}}
  >

    {/* IMAGE */}
  <img
  key={selectedImage}
  src={selectedImage}
  alt="preview"
  className="max-h-[95%] max-w-[95%] object-contain transition duration-300"
  onClick={(e) => e.stopPropagation()}
/>

    {/* CLOSE BUTTON */}
    <button
      className="absolute top-5 right-5 text-white text-2xl"
     onClick={() => setShowPreview(false)}
    >
      ✕
    </button>

  </div>
)}
      </div>
    </div>
  );
}

export default ProductDetail;
