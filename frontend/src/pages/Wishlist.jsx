import ProductCard from "../components/ProductCard";

function Wishlist({ wishlist, toggleWishlist, phoneNumber }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        ❤️ Your Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <p className="text-gray-500 text-center">
          No items saved yet 😢
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              phoneNumber={phoneNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;