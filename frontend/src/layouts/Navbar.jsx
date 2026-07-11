import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Moon,
  Sun,
  Menu,
  X,
  Package,
  Home,
  Store,
} from "lucide-react";
import {
  toggleDarkMode,
  setSearchQuery,
  toggleMobileMenu,
  closeMobileMenu,
} from "../store/uiSlice";
import { logoutUser } from "../store/authSlice";
import { productApi } from "../api";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { darkMode, searchQuery, mobileMenuOpen } = useSelector((s) => s.ui);
  const { cart } = useSelector((s) => s.cart);

  const cartCount =
    cart?.items?.filter((i) => !i.savedForLater).reduce((s, i) => s + i.quantity, 0) || 0;

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await productApi.list({ search: searchQuery.trim(), limit: 5 });
        if (response.data?.success) {
          setSuggestions(response.data.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Error fetching search suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (searchRef.current && !searchRef.current.contains(event.target)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target))
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e, isMobile = false) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        const selectedProduct = suggestions[highlightedIndex];
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        dispatch(closeMobileMenu());
        navigate(`/product/${selectedProduct.slug}`);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const renderSuggestionsList = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="absolute left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900 animate-in fade-in slide-in-from-top-1 duration-200">
        {suggestions.map((product, index) => {
          const isHighlighted = highlightedIndex === index;
          const discount = product.comparePrice
            ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
            : 0;

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              onClick={() => {
                setShowSuggestions(false);
                setHighlightedIndex(-1);
                dispatch(closeMobileMenu());
              }}
              className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${
                isHighlighted
                  ? "bg-primary-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <img
                src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                alt=""
                className="h-10 w-10 rounded-md object-cover border border-gray-100 dark:border-gray-800"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.category?.name}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  ₹{Number(product.price).toLocaleString()}
                </span>
                {discount > 0 && (
                  <span className="ml-1.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
                    -{discount}%
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(closeMobileMenu());
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  const navLink = (to, label, icon) => (
    <Link
      to={to}
      onClick={() => dispatch(closeMobileMenu())}
      className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="bg-primary-600 px-3 py-1.5 text-center text-xs text-white sm:text-sm">
        <span className="hidden sm:inline">
          Free delivery on orders above ₹999 | Use code WELCOME10
        </span>
        <span className="sm:hidden">Free delivery ₹999+ · WELCOME10</span>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        {/* Top row */}
        <div className="flex items-center gap-2 py-2.5 sm:gap-4 sm:py-3">
          <button
            type="button"
            onClick={() => dispatch(toggleMobileMenu())}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            to="/"
            className="shrink-0 text-xl font-bold text-primary-600 sm:text-2xl"
            onClick={() => dispatch(closeMobileMenu())}
          >
            ShopVerse
          </Link>

          <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 lg:flex">
            <div ref={searchRef} className="relative w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                onKeyDown={(e) => handleKeyDown(e, false)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
              {renderSuggestionsList()}
            </div>
          </form>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              onClick={() => dispatch(toggleDarkMode())}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="hidden rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white sm:block md:px-3 md:text-sm dark:bg-gray-100 dark:text-gray-900"
                  >
                    Admin
                  </Link>
                )}
                <Link to="/wishlist" className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/cart" className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white sm:h-5 sm:w-5 sm:text-xs">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                <div className="group relative hidden md:block">
                  <button type="button" className="flex items-center gap-1 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <User className="h-5 w-5" />
                    <span className="max-w-[80px] truncate text-sm">{user.firstName}</span>
                  </button>
                  <div className="invisible absolute right-0 z-10 mt-1 w-48 rounded-lg border bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900">
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                      Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => dispatch(logoutUser())}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="text-sm font-medium hover:text-primary-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="pb-2.5 lg:hidden">
          <div ref={mobileSearchRef} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              onKeyDown={(e) => handleKeyDown(e, true)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
            />
            {renderSuggestionsList()}
          </div>
        </form>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => dispatch(closeMobileMenu())}
            aria-hidden
          />
          <nav className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col bg-white shadow-xl dark:bg-gray-900 lg:hidden">
            <div className="flex items-center justify-between border-b p-4 dark:border-gray-800">
              <span className="font-bold text-primary-600">Menu</span>
              <button
                type="button"
                onClick={() => dispatch(closeMobileMenu())}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {navLink("/", "Home", <Home className="h-5 w-5" />)}
              {navLink("/shop", "Shop", <Store className="h-5 w-5" />)}
              {user ? (
                <>
                  {navLink("/cart", "Cart", <ShoppingCart className="h-5 w-5" />)}
                  {navLink("/wishlist", "Wishlist", <Heart className="h-5 w-5" />)}
                  {navLink("/orders", "Orders", <Package className="h-5 w-5" />)}
                  {navLink("/profile", "Profile", <User className="h-5 w-5" />)}
                  {user.role === "ADMIN" &&
                    navLink("/admin", "Admin Panel", <User className="h-5 w-5" />)}
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(logoutUser());
                      dispatch(closeMobileMenu());
                    }}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="mt-4 space-y-2 border-t pt-4 dark:border-gray-800">
                  <Link
                    to="/login"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="block rounded-lg border py-3 text-center font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="block rounded-lg bg-primary-600 py-3 text-center font-medium text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
