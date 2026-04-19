import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetailStandard";
import { getSettings } from "./services/settingsService";
import logo from "./assets/logo.png";

function App() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showLogin, setShowLogin] = useState(false);
  const [sessionInterrupted, setSessionInterrupted] = useState(false);

  const logout = ({ preserveAdminState = false } = {}) => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowLogin(true);
    setSessionInterrupted(preserveAdminState);
  };

  useEffect(() => {
    const handleTokenExpired = () => logout({ preserveAdminState: true });
    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => window.removeEventListener('tokenExpired', handleTokenExpired);
  }, []);

  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  });

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
const [showTimeout, setShowTimeout] = useState(false);
const [serverError, setServerError] = useState(false);
const phoneNumber = settings?.phone;

useEffect(() => {
  getSettings()
    .then(setSettings)
    .catch((err) => {
      console.error(err);
      setServerError(true);
    })
    .finally(() => setLoadingSettings(false));
}, []);


useEffect(() => {
  const timer = setTimeout(() => {
    if (loadingSettings) {
      setShowTimeout(true);
    }
  }, 15000);
  

  return () => clearTimeout(timer);
}, [loadingSettings]);



  /* ---------------- LOCAL STORAGE ---------------- */

  useEffect(() => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  /* ---------------- WISHLIST ---------------- */

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find(
        (item) => item._id === product._id
      );

      if (exists) {
        return prev.filter(
          (item) => item._id !== product._id
        );
      }

      return [...prev, product];
    });
  };

  /* ---------------- CART ---------------- */

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(
        (item) => item._id === product._id
      );

      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                qty: (item.qty || 1) + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 0) return;

    setCart((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, qty }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter(
        (item) => item._id !== id
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };


  if (serverError) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">
      <img
        src={logo}
        alt="HOMLY DEALS"
        className="w-20 h-20 object-contain mb-4"
      />

      <h1 className="text-2xl font-bold">
        Server Unavailable
      </h1>

      <p className="text-gray-500 mt-2">
        Backend is sleeping or offline.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-5 bg-black text-white px-5 py-2 rounded-lg"
      >
        Retry
      </button>
    </div>
  );
}


if (loadingSettings) {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">

      {/* Logo + Spinner */}
      <div className="flex flex-col items-center mb-10">

<img
  src={logo}
  alt="HOMLY DEALS"
  className="w-20 h-20 object-contain animate-pulse"
/>

  <h1 className="mt-4 text-2xl font-bold tracking-wide">
    HOMLY DEALS
  </h1>

  <p className="text-gray-500 mt-2">
    Loading premium furniture...
  </p>

</div>

      {/* Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl p-4 shadow"
          >
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>

            <div className="h-5 bg-gray-200 rounded mt-4 animate-pulse"></div>

            <div className="h-4 bg-gray-200 rounded mt-2 w-2/3 animate-pulse"></div>

            <div className="h-10 bg-gray-200 rounded mt-4 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
  /* ---------------- ROUTES ---------------- */

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              preserveAdminState={sessionInterrupted}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              cart={cart}
              addToCart={addToCart}
            />
          }
        />

        <Route
          path="/category/:categoryName"
          element={
            <HomePage
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              preserveAdminState={sessionInterrupted}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              cart={cart}
              addToCart={addToCart}
            />
          }
        />
  <Route
    path="/product/:id"
    element={
      <ProductDetail
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        cart={cart}
        addToCart={addToCart}
      />
    }
  />
        <Route
          path="/login"
          element={
            <Login
              onLogin={() => {
                setIsLoggedIn(true);
                navigate("/");
              }}
            />
          }
        />

     <Route
    path="/wishlist"
    element={
      <Wishlist
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        phoneNumber={phoneNumber}
        addToCart={addToCart}
        cart={cart}
      />
    }
  />

        <Route
          path="/cart"
          element={
         <Cart
    cart={cart}
    updateQty={updateQty}
    removeFromCart={removeFromCart}
    clearCart={clearCart}
    phoneNumber={phoneNumber}
  />
          }
        />
      </Routes>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 relative">
            {!sessionInterrupted && (
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <Login
              onLogin={() => {
                setIsLoggedIn(true);
                setShowLogin(false);
                setSessionInterrupted(false);
                window.dispatchEvent(new CustomEvent("sessionRestored"));
              }}
              onBack={() => {
                setShowLogin(false);
                setSessionInterrupted(false);
              }}
              isModal={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
