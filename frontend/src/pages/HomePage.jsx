import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import AddProduct from "../components/AddProduct";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import SettingsForm from "../components/SettingsForm";

import {
  getProducts,
  deleteProduct,
  updateProduct,
} from "../services/productService";

import { getSettings } from "../services/settingsService";
import { normalizeWoodTypes } from "../utils/productUtils";



const OFFER_GRACE_PERIOD_MS = 60 * 60 * 1000;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "best-seller", label: "Best Seller" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "offers-first", label: "Offers First" },
  { value: "name-az", label: "Name: A to Z" },
];

const SEARCH_OPTIONS = {
  all: "All",
  product: "Product",
  category: "Category",
  woodType: "Wood Type",
};

function HomePage({
  isLoggedIn,
  setIsLoggedIn,
  wishlist,
  toggleWishlist,
  cart,
  addToCart,
}) {
  const navigate = useNavigate();
  const { categoryName } = useParams();

  const activeCategory = categoryName || null;

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [settings, setSettings] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [categorySort, setCategorySort] = useState("featured");
  const [visibleSearchCount, setVisibleSearchCount] = useState(3);
  const [now, setNow] = useState(() => Date.now());

  const adminSectionRef = useRef(null);
  const productsSectionRef = useRef(null);
  const footerRef = useRef(null);
  const addProductRef = useRef(null);

  /* ---------------- HELPERS ---------------- */

  const getSearchValues = (product, currentType) => {
    if (currentType === "all") {
      return [
        product.name,
        product.category,
        ...normalizeWoodTypes(product.woodType),
      ].filter(Boolean);
    }

    if (currentType === "category") {
      return product.category ? [product.category] : [];
    }

    if (currentType === "woodType") {
      return normalizeWoodTypes(product.woodType);
    }

    return product.name ? [product.name] : [];
  };

  const isOfferActive = (product, currentNow = Date.now()) => {
    if (!product.offer?.isOffer) return false;

    if (!product.offer?.expiresAt) return true;

    const expiryTime = new Date(
      product.offer.expiresAt
    ).getTime();

    if (Number.isNaN(expiryTime)) return true;

    return (
      currentNow <
      expiryTime + OFFER_GRACE_PERIOD_MS
    );
  };

  const getDisplayPrice = (product) =>
    isOfferActive(product, now)
      ? product.offer.offerPrice
      : product.price;

  const sortProducts = (items, sortBy) => {
    const list = [...items];

    switch (sortBy) {
      case "price-low-high":
        return list.sort(
          (a, b) =>
            getDisplayPrice(a) -
            getDisplayPrice(b)
        );

      case "price-high-low":
        return list.sort(
          (a, b) =>
            getDisplayPrice(b) -
            getDisplayPrice(a)
        );

      case "best-seller":
        return list.sort((a, b) => {
          const aScore =
            a.label === "Best Seller" ? 1 : 0;
          const bScore =
            b.label === "Best Seller" ? 1 : 0;

          return (
            bScore -
              aScore ||
            a.name.localeCompare(b.name)
          );
        });

      case "new-arrivals":
        return list.sort((a, b) => {
          const aScore =
            a.label === "New" ? 1 : 0;
          const bScore =
            b.label === "New" ? 1 : 0;

          return (
            bScore -
              aScore ||
            a.name.localeCompare(b.name)
          );
        });

      case "offers-first":
        return list.sort((a, b) => {
          const aScore = isOfferActive(a)
            ? 1
            : 0;

          const bScore = isOfferActive(b)
            ? 1
            : 0;

          return (
            bScore -
              aScore ||
            getDisplayPrice(a) -
              getDisplayPrice(b)
          );
        });

      case "name-az":
        return list.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      default:
        return list;
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ---------------- DERIVED ---------------- */

  const offers = products.filter((product) =>
    isOfferActive(product, now)
  );

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  const filteredProducts = normalizedSearch
    ? products.filter((product) =>
        getSearchValues(
          product,
          searchType
        ).some((value) =>
          value
            .toLowerCase()
            .includes(normalizedSearch)
        )
      )
    : [];

  const canMatchInsideWord =
    normalizedSearch.length > 1;

  const searchSuggestions =
    normalizedSearch
      ? [
          ...products.flatMap((product) =>
            getSearchValues(
              product,
              searchType
            ).map((value) => ({
              value,
              kind:
                SEARCH_OPTIONS[
                  searchType
                ],
              matchText:
                value.toLowerCase(),
            }))
          ),
        ]
          .filter(Boolean)
          .filter(
            (item, index, array) =>
              array.findIndex(
                (candidate) =>
                  candidate.value.toLowerCase() ===
                    item.value.toLowerCase() &&
                  candidate.kind ===
                    item.kind
              ) === index
          )
          .map((item) => {
            let score =
              Number.POSITIVE_INFINITY;

            if (
              item.matchText.startsWith(
                normalizedSearch
              )
            ) {
              score =
                item.kind ===
                "Wood Type"
                  ? 0
                  : item.kind ===
                    "Category"
                  ? 1
                  : 2;
            } else if (
              canMatchInsideWord &&
              item.matchText.includes(
                normalizedSearch
              )
            ) {
              score =
                item.kind ===
                "Wood Type"
                  ? 3
                  : item.kind ===
                    "Category"
                  ? 4
                  : 5;
            }

            return {
              ...item,
              score,
            };
          })
          .filter(
            (item) =>
              item.score !==
              Number.POSITIVE_INFINITY
          )
          .sort(
            (a, b) =>
              a.score - b.score ||
              a.value.localeCompare(
                b.value
              )
          )
          .slice(0, 5)
      : [];

  const visibleSearchResults =
    filteredProducts.slice(
      0,
      visibleSearchCount
    );

  const categoryProducts =
    activeCategory
      ? sortProducts(
          products.filter(
            (product) =>
              product.category ===
              activeCategory
          ),
          categorySort
        )
      : [];

  const phoneNumber =
    settings?.phone;

  /* ---------------- DATA LOAD ---------------- */

  useEffect(() => {
    let mounted = true;

    getSettings()
      .then((data) => {
        if (mounted)
          setSettings(data);
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadProducts =
      async () => {
        try {
          const data =
            await getProducts();
          setProducts(data);
        } catch (error) {
          console.error(error);
        }
      };

    loadProducts();
  }, []);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setNow(Date.now());
      }, 60000);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  useEffect(() => {
    if (
      editingProduct &&
      isLoggedIn
    ) {
    scrollToSection(addProductRef);
    }
  }, [
    editingProduct,
    isLoggedIn,
  ]);

  /* ---------------- ACTIONS ---------------- */

  const refreshSettings =
    async () => {
      try {
        const data =
          await getSettings();
        setSettings(data);
      } catch (error) {
        console.error(error);
      }
    };

  const handleNewProduct = (
    product
  ) => {
    setProducts((prev) => [
      product,
      ...prev,
    ]);
  };

  const handleDelete =
    async (id) => {
      try {
        const res =
          await deleteProduct(
            id
          );

        if (
          res.message ===
          "Product deleted"
        ) {
          setProducts((prev) =>
            prev.filter(
              (p) =>
                p._id !== id
            )
          );
        } else {
          alert(
            res.message ||
              "Delete failed"
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

  const handleUpdate =
    async (
      id,
      updatedData
    ) => {
      try {
        const updated =
          await updateProduct(
            id,
            updatedData
          );

        setProducts((prev) =>
          prev.map((p) =>
            p._id === id
              ? updated
              : p
          )
        );

        setEditingProduct(
          null
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleEditProduct = (
    product
  ) => {
    setEditingProduct(
      product
    );
  };

  const handleSearchChange = (
    value
  ) => {
    setSearchQuery(value);
    navigate("/");
    setCategorySort(
      "featured"
    );
    setVisibleSearchCount(
      3
    );
  };

  const handleSuggestionSelect =
    (value) => {
      setSearchQuery(value);
      navigate("/");
      setCategorySort(
        "featured"
      );
      setVisibleSearchCount(
        3
      );
    };

  const handleSearchSubmit =
    () => {
      if (
        !searchQuery.trim()
      )
        return;

      navigate("/");
      scrollToSection(
        productsSectionRef
      );
    };

  /* ---------------- JSX ---------------- */

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">

        <Header
          settings={settings}
          isLoggedIn={
            isLoggedIn
          }
          searchQuery={
            searchQuery
          }
          searchSuggestions={
            searchSuggestions
          }
          searchType={
            searchType
          }
          onSearchChange={
            handleSearchChange
          }
          onSearchTypeChange={(
            value
          ) => {
            setSearchType(
              value
            );
            setSearchQuery(
              ""
            );
            navigate("/");
            setCategorySort(
              "featured"
            );
            setVisibleSearchCount(
              3
            );
          }}
          onSearchSubmit={
            handleSearchSubmit
          }
          onSuggestionSelect={
            handleSuggestionSelect
          }
          onProductsClick={() =>
            scrollToSection(
              productsSectionRef
            )
          }
          onContactClick={() =>
            scrollToSection(
              footerRef
            )
          }
          onLoginClick={() =>
            navigate(
              "/login"
            )
          }
          onLogout={() => {
            localStorage.removeItem(
              "token"
            );
            setIsLoggedIn(
              false
            );
          }}
          wishlistCount={
            wishlist.length
          }
          onWishlistClick={() =>
            navigate(
              "/wishlist"
            )
          }
          cartCount={
            cart.length
          }
          onCartClick={() =>
            navigate(
              "/cart"
            )
          }
        />

        <div className="h-36 sm:h-32 lg:h-28" />

        {/* HERO */}
        <div className="relative rounded-2xl overflow-hidden mb-12 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
            alt="furniture"
            className="w-full h-[300px] md:h-[400px] object-cover"
          />

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Premium Wooden Furniture
            </h1>

            <p className="text-sm md:text-lg opacity-90 mb-4">
              Crafted with care.
              Designed for life.
            </p>

            <button
              onClick={() =>
                scrollToSection(
                  productsSectionRef
                )
              }
              className="bg-yellow-500 text-black px-6 py-2 rounded-full font-medium hover:bg-yellow-400 transition"
            >
              Explore Collection
            </button>
          </div>
        </div>

        {/* ADMIN */}
        <div
          ref={
            adminSectionRef
          }
          className="mb-6"
        >
          {isLoggedIn && (
            <SettingsForm
              onUpdate={
                refreshSettings
              }
            />
          )}

         {isLoggedIn && (
  <div ref={addProductRef}>
    <AddProduct
      onProductAdded={handleNewProduct}
      editingProduct={editingProduct}
      onUpdate={handleUpdate}
    />
  </div>
)}
        </div>

        {/* OFFERS */}
        {offers.length >
          0 &&
          !normalizedSearch && (
            <div className="mb-14">
              <h2 className="text-2xl font-semibold mb-6">
                🔥 Special
                Offers
              </h2>

              {offers.length <=
              3 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {offers.map(
                    (
                      product
                    ) => (
                      <ProductCard
                        key={
                          product._id
                        }
                        product={
                          product
                        }
                        isLoggedIn={
                          false
                        }
                        phoneNumber={
                          phoneNumber
                        }
                        wishlist={
                          wishlist
                        }
                        toggleWishlist={
                          toggleWishlist
                        }
                        addToCart={
                          addToCart
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                  {offers.map(
                    (
                      product
                    ) => (
                      <div
                        key={
                          product._id
                        }
                        className="min-w-[280px]"
                      >
                        <ProductCard
                          product={
                            product
                          }
                          isLoggedIn={
                            false
                          }
                          phoneNumber={
                            phoneNumber
                          }
                          wishlist={
                            wishlist
                          }
                          toggleWishlist={
                            toggleWishlist
                          }
                          addToCart={
                            addToCart
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

        <div
          ref={
            productsSectionRef
          }
        >
          {/* SEARCH */}
          {normalizedSearch && (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Search
                    Results
                  </h2>

                  <p className="text-sm text-gray-500">
                    {
                      filteredProducts.length
                    }{" "}
                    product
                    {filteredProducts.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    found
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery(
                      ""
                    );
                    setVisibleSearchCount(
                      3
                    );
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Clear
                  search
                </button>
              </div>

              {filteredProducts.length >
              0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {visibleSearchResults.map(
                      (
                        product
                      ) => (
                        <ProductCard
                          key={
                            product._id
                          }
                          product={
                            product
                          }
                          onDelete={
                            handleDelete
                          }
                          onEdit={
                            handleEditProduct
                          }
                          isLoggedIn={
                            isLoggedIn
                          }
                          phoneNumber={
                            phoneNumber
                          }
                          searchQuery={
                            searchQuery
                          }
                          searchType={
                            searchType
                          }
                          wishlist={
                            wishlist
                          }
                          toggleWishlist={
                            toggleWishlist
                          }
                          addToCart={
                            addToCart
                          }
                        />
                      )
                    )}
                  </div>

                  {filteredProducts.length >
                    visibleSearchCount && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() =>
                          setVisibleSearchCount(
                            (
                              prev
                            ) =>
                              prev +
                              3
                          )
                        }
                        className="rounded-full bg-black px-5 py-2 text-sm text-white"
                      >
                        Show
                        more
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
                  No products
                  matched.
                </div>
              )}
            </>
          )}

          {/* CATEGORY GRID */}
          {!normalizedSearch &&
            !activeCategory && (
              <>
                <h2 className="text-2xl font-semibold text-center mb-8 tracking-wide">
                  Explore
                  Categories
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {[
                    ...new Set(
                      products.map(
                        (
                          p
                        ) =>
                          p.category
                      )
                    ),
                  ].map(
                    (
                      cat
                    ) => {
                      const sample =
                        products.find(
                          (
                            p
                          ) =>
                            p.category ===
                            cat
                        );

                      return (
                        <div
                          key={
                            cat
                          }
                          onClick={() => {
                            navigate(
                              `/category/${encodeURIComponent(
                                cat
                              )}`
                            );

                            setCategorySort(
                              "featured"
                            );
                          }}
                          className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-200 hover:scale-105 transition duration-300"
                        >
                          <img
                            src={
                              sample?.image
                            }
                            alt={
                              cat
                            }
                            className="w-full aspect-[4/3] object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                          <div className="absolute bottom-4 left-4 text-white">
                            <p className="text-xs uppercase opacity-80">
                              Furniture
                            </p>

                            <h3 className="text-xl font-bold">
                              {
                                cat
                              }
                            </h3>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}

          {/* CATEGORY PRODUCTS */}
          {!normalizedSearch &&
            activeCategory && (
              <>
                <button
                  onClick={() =>
                    navigate(
                      "/"
                    )
                  }
                  className="mb-6 text-sm text-gray-600 hover:underline"
                >
                  ← Back to
                  Categories
                </button>

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {
                        activeCategory
                      }
                    </h2>

                    <p className="text-sm text-gray-500">
                      {
                        categoryProducts.length
                      }{" "}
                      product
                      {categoryProducts.length ===
                      1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <label className="flex flex-col text-sm text-gray-600">
                    Sort by

                    <select
                      value={
                        categorySort
                      }
                      onChange={(
                        e
                      ) =>
                        setCategorySort(
                          e
                            .target
                            .value
                        )
                      }
                      className="mt-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm"
                    >
                      {SORT_OPTIONS.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {categoryProducts.map(
                    (
                      product
                    ) => (
                      <ProductCard
                        key={
                          product._id
                        }
                        product={
                          product
                        }
                        onDelete={
                          handleDelete
                        }
                        onEdit={
                          handleEditProduct
                        }
                        isLoggedIn={
                          isLoggedIn
                        }
                        phoneNumber={
                          phoneNumber
                        }
                        wishlist={
                          wishlist
                        }
                        toggleWishlist={
                          toggleWishlist
                        }
                        addToCart={
                          addToCart
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
        </div>

        <div ref={footerRef}>
          <Footer
            settings={
              settings
            }
          />
        </div>
      </div>

      <WhatsAppButton
        phone={phoneNumber}
      />
    </div>
  );
}

export default HomePage;