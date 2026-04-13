import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetailStandard";
import { getSettings } from "./services/settingsService";

function App() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  });

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [settings, setSettings] = useState(null);
const phoneNumber = settings?.phone;

useEffect(() => {
  getSettings()
    .then(setSettings)
    .catch(console.error);
}, []);

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

  /* ---------------- ROUTES ---------------- */

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
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
  );
}

export default App;