import logo from "../assets/logo.png";
import { FiChevronDown, FiMoreHorizontal, FiSearch } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

const SEARCH_FILTERS = [
  { value: "all", label: "All" },
  { value: "product", label: "Product" },
  { value: "category", label: "Category" },
  { value: "woodType", label: "Wood Type" },
];

function Header({
  settings,
  isLoggedIn,
  onLoginClick,
  onLogout,
  searchQuery,
  searchType,
  searchSuggestions,
  onSearchChange,
  onSearchTypeChange,
  onSearchSubmit,
  onSuggestionSelect,
  onProductsClick,
  onContactClick,
  wishlistCount,
  onWishlistClick,
   cartCount,       
  onCartClick   
})  {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const searchInputRef = useRef(null);
  const searchAreaRef = useRef(null);
  const lastScrollYRef = useRef(0);

  const showSuggestions =
    isSearchFocused && searchQuery.trim() && searchSuggestions.length > 0;
  const activeFilter =
    SEARCH_FILTERS.find((filter) => filter.value === searchType) ||
    SEARCH_FILTERS[0];
  const searchPlaceholder =
    searchType === "all"
      ? "Search products, categories, wood types..."
      : searchType === "category"
        ? "Search category..."
        : searchType === "woodType"
          ? "Search wood type..."
          : "Search product...";

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);
useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollYRef.current;

    setIsScrolled(currentScrollY > 20);

    if (currentScrollY <= 20) {
      setIsHeaderVisible(true);
    } else if (diff > 12) {
      // scrolling down enough
      setIsHeaderVisible(false);
    } else if (diff < -6) {
      // scrolling up slightly
      setIsHeaderVisible(true);
    }

    lastScrollYRef.current = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  return () =>
    window.removeEventListener("scroll", handleScroll);
}, []);
  
  return (
    <header
      className={`fixed left-1/2 top-4 z-40 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 border border-white/70 bg-white/90 backdrop-blur transition-all duration-300 ${
        isScrolled
          ? "rounded-2xl px-3 py-2 sm:px-4 sm:py-4 shadow-[0_14px_38px_rgba(15,23,42,0.14)]"
          : "rounded-xl px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
      } ${isHeaderVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"}`}
    >
      <div className="flex flex-row items-center justify-between gap-2 flex-wrap lg:flex-row">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="h-10 w-10 sm:h-14 sm:w-14 object-contain" />

         <div className="min-w-0">
           <h1 className="truncate text-base sm:text-xl font-bold tracking-wide">
              {settings?.shopName || "HOMLY DEALS"}
            </h1>
           <p className="text-xs sm:text-sm text-gray-500">Furniture and home deals</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:min-w-[640px] lg:w-auto lg:justify-end">
          {isSearchOpen ? (
            <form
              ref={searchAreaRef}
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit();
              }}
              className="flex w-full gap-2 lg:max-w-2xl"
            >
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterMenuOpen((prev) => !prev);
                    setIsNavMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-50"
                >
                  <span>{activeFilter.label}</span>
                  <FiChevronDown className="text-sm text-gray-500" />
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute left-0 top-full z-30 mt-2 min-w-[170px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                    {SEARCH_FILTERS.map((filter) => {
                      const isActive = searchType === filter.value;

                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onMouseDown={() => {
                            onSearchTypeChange(filter.value);
                            setIsFilterMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                            isActive
                              ? "bg-gray-100 font-medium text-black"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{filter.label}</span>
                          {isActive && (
                            <span className="text-xs text-gray-500">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsFilterMenuOpen(false);
                    setIsNavMenuOpen(false);
                  }}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setIsSearchFocused(false);
                      const activeElement = document.activeElement;
                      const isInsideSearchArea =
                        searchAreaRef.current?.contains(activeElement);

                      if (!isInsideSearchArea && !searchQuery.trim()) {
                        setIsSearchOpen(false);
                        setIsFilterMenuOpen(false);
                      }
                    }, 150);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 text-sm outline-none transition focus:border-black"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1 top-1 rounded-md bg-black px-3 py-1.5 text-white transition hover:bg-gray-800"
                >
                  <FiSearch className="text-base" />
                </button>

                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.kind}-${suggestion.value}`}
                        type="button"
                        onMouseDown={() => onSuggestionSelect(suggestion.value)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-800">
                          {suggestion.value}
                        </span>
                        <span className="text-xs text-gray-500">
                          {suggestion.kind}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <button
              type="button"
              aria-label="Open search"
              onClick={() => {
                setIsSearchOpen(true);
                setIsFilterMenuOpen(false);
                setIsNavMenuOpen(false);
              }}
              className="self-start rounded-full border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 transition hover:bg-gray-100 lg:self-auto"
            >
              <FiSearch className="text-lg" />
            </button>
          )}

          <div className="relative self-end lg:self-auto">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => {
                setIsNavMenuOpen((prev) => !prev);
                setIsFilterMenuOpen(false);
              }}
              className="rounded-full border border-gray-300 p-2 sm:p-2.5text-gray-700 transition hover:bg-gray-100"
            >
              <FiMoreHorizontal className="text-lg" />
            </button>

            {isNavMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onMouseDown={() => {
                    onProductsClick();
                    setIsNavMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Products
                </button>

                               <button
  type="button"
  onMouseDown={() => {
    onWishlistClick();
    setIsNavMenuOpen(false);
  }}
 className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
  wishlistCount > 0 ? "text-red-500 font-medium" : "text-gray-700"
}`}
>
  ❤️ Wishlist ({wishlistCount})
</button>
<button
  onMouseDown={() => {
    onCartClick();
    setIsNavMenuOpen(false);
  }}
  className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
>
  🛒 Cart {cartCount > 0 && `(${cartCount})`}
</button>
                <button
                  type="button"
                  onMouseDown={() => {
                    onContactClick();
                    setIsNavMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  Contact
                </button>

 

                {isLoggedIn ? (
                  <button
                    type="button"
                    onMouseDown={() => {
                      onLogout();
                      setIsNavMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    onMouseDown={() => {
                      onLoginClick();
                      setIsNavMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    Admin Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
