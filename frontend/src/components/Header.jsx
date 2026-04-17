import logo from "../assets/logo.png";
import {
  FiChevronDown,
  FiHeart,
  FiMenu,
  FiPackage,
  FiPhone,
  FiSearch,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
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
  onCartClick,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const searchInputRef = useRef(null);
  const searchAreaRef = useRef(null);
  const menuAreaRef = useRef(null);
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

      setIsScrolled(currentScrollY > 16);

      if (currentScrollY <= 20) {
        setIsHeaderVisible(true);
      } else if (diff > 12) {
        setIsHeaderVisible(false);
      } else if (diff < -8) {
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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const target = event.target;

      if (
        !searchAreaRef.current?.contains(target) &&
        !menuAreaRef.current?.contains(target)
      ) {
        setIsFilterMenuOpen(false);
        setIsNavMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const menuButtonClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-900 hover:text-slate-900";

  const navItems = [
    {
      key: "products",
      label: "Products",
      icon: FiPackage,
      onClick: onProductsClick,
    },
    {
      key: "wishlist",
      label: "Wishlist",
      icon: FiHeart,
      badge: wishlistCount > 0 ? wishlistCount : null,
      onClick: onWishlistClick,
    },
    {
      key: "cart",
      label: "Cart",
      icon: FiShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
      onClick: onCartClick,
    },
    {
      key: "contact",
      label: "Contact",
      icon: FiPhone,
      onClick: onContactClick,
    },
  ];

  return (
    <header
      className={`fixed left-1/2 top-4 z-40 w-[calc(100%-1.25rem)] max-w-6xl -translate-x-1/2 transition-all duration-300 ${
        isScrolled
          ? "glass-surface rounded-2xl px-3 py-2 shadow-[0_14px_38px_rgba(15,23,42,0.14)] sm:px-4 sm:py-3"
          : "glass-surface rounded-xl px-3 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] sm:rounded-2xl sm:px-4 sm:py-3"
      } ${isHeaderVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo"
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />

          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-wide text-slate-900 sm:text-xl">
              {settings?.shopName || "HOMLY DEALS"}
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Furniture and home deals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isSearchOpen ? (
            <form
              ref={searchAreaRef}
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit();
              }}
              className="flex w-full gap-2 md:w-[min(62vw,720px)]"
            >
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterMenuOpen((prev) => !prev);
                    setIsNavMenuOpen(false);
                  }}
                  className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-800 transition hover:border-slate-400"
                >
                  <span>{activeFilter.label}</span>
                  <FiChevronDown className="text-sm text-slate-500" />
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute left-0 top-full z-30 mt-2 min-w-[170px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
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
                              ? "bg-slate-100 font-medium text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{filter.label}</span>
                          {isActive && (
                            <span className="text-xs text-slate-500">
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
                  className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-slate-900"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 top-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-white transition hover:bg-slate-700"
                >
                  <FiSearch className="text-base" />
                </button>

                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.kind}-${suggestion.value}`}
                        type="button"
                        onMouseDown={() => onSuggestionSelect(suggestion.value)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-800">
                          {suggestion.value}
                        </span>
                        <span className="text-xs text-slate-500">
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
              className={menuButtonClass}
            >
              <FiSearch className="text-lg" />
            </button>
          )}

          <div className="relative" ref={menuAreaRef}>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => {
                setIsNavMenuOpen((prev) => !prev);
                setIsFilterMenuOpen(false);
              }}
              className={menuButtonClass}
            >
              <FiMenu className="text-lg" />
            </button>

            {isNavMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onMouseDown={() => {
                        item.onClick();
                        setIsNavMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="text-base" />
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-semibold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}

                {isLoggedIn ? (
                  <button
                    type="button"
                    onMouseDown={() => {
                      onLogout();
                      setIsNavMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
                  >
                    <FiUser className="text-base" />
                    Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    onMouseDown={() => {
                      onLoginClick();
                      setIsNavMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiUser className="text-base" />
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