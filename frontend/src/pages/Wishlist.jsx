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
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="app-surface mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Saved Items
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Your Wishlist
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Products you saved for later.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="app-pill"
          >
            Back to Home
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="app-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
              SAVE
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-slate-900">
              Wishlist is empty
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Save products you like and they will appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
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
