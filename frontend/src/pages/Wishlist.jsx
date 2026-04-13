import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Wishlist({
  wishlist,
  toggleWishlist,
  phoneNumber,
  addToCart,
  cart,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
              Saved Items
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              ❤️ Your Wishlist
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Products you saved for later.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
          >
            ← Back to Home
          </button>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              ❤️
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-gray-900">
              Wishlist is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Save products you like and they will appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                phoneNumber={phoneNumber}
                addToCart={addToCart}
                cart={cart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;