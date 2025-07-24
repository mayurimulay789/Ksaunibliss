import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  ShoppingBag,
  User,
  Heart,
} from "lucide-react";
import axios from "axios";
import { logout } from "../store/slices/authSlice";
import { fetchCategories } from "../store/slices/categorySlice";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [productPreviews, setProductPreviews] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth || {})
  const { categories } = useSelector((state) => state.categories || {})
  const { items: cartItems } = useSelector((state) => state.cart || { items: [] })
  const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] })

  const fetchCategoriesCallback = useCallback(() => {
    dispatch(fetchCategories({ showOnHomepage: true }))
  }, [dispatch])

  useEffect(() => {
    fetchCategoriesCallback()
  }, [fetchCategoriesCallback])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setIsMenuOpen(false)
    }
  });

  const fetchProductPreview = async (categoryId) => {
    if (!productPreviews[categoryId]) {
      try {
        const { data } = await axios.get(
          `/api/products?category=${categoryId}&priceRange=0%2C10000&page=1&limit=4`
        );
        if (data?.products) {
          setProductPreviews((prev) => ({
            ...prev,
            [categoryId]: data.products,
          }));
        }
      } catch (err) {
        console.error("Failed to load preview for category:", categoryId);
      }
    }
  };

  const renderDropdown = (label, categoryList) => (
    <div
      className="relative"
      onMouseEnter={() => setHoveredMenu(label)}
      onMouseLeave={() => setHoveredMenu(null)}
    >
      <div className="flex items-center cursor-pointer space-x-1 text-gray-700 font-medium hover:text-pink-600">
        <span>{label}</span>
        <ChevronDown className="w-4 h-4" />
      </div>
      <AnimatePresence>
        {hoveredMenu === label && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-[400px] mt-2 bg-white border rounded shadow-lg z-50 p-4"
          >
            {categoryList.map((cat) => (
              <div
                key={cat._id}
                className="mb-4"
                onMouseEnter={() => fetchProductPreview(cat._id)}
              >
                <div
                  onClick={() => navigateToCategory(cat._id)}
                  className="cursor-pointer text-sm font-semibold text-pink-600 mb-2"
                >
                  {cat.name}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(productPreviews[cat._id] || []).map((prod) => (
                    <img
                      key={prod._id}
                      src={prod.images?.[0]?.url}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded-md cursor-pointer hover:scale-105 transition"
                      onClick={() => navigate(`/product/${prod._id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const handleLogout = () => {
    dispatch(logout());
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="flex items-center justify-between py-4">
          <div
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-red-600 cursor-pointer"
          >
            KsauniBliss
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 justify-center mx-8 max-w-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim())
                  navigate(`/products?search=${searchQuery}`);
              }}
              className="relative w-full"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 transition-colors border-2 border-gray-200 rounded-full outline-none focus:border-pink-500"
              />
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <div
              onClick={() => navigate("/wishlist")}
              className="relative hidden md:flex items-center space-x-1 text-gray-700 hover:text-pink-600 cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </div>

            {/* Cart */}
            <div
              onClick={() => navigate("/cart")}
              className="relative flex items-center space-x-1 text-gray-700 hover:text-pink-600 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden md:block text-sm">Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.reduce((t, i) => t + (i.quantity || 0), 0)}
                </span>
              )}
            </div>

            {/* Profile / Login */}
            <div className="relative hidden md:flex items-center text-gray-700 hover:text-pink-600 cursor-pointer">
              <User className="w-5 h-5 mr-1" />
              <span
                onClick={() => {
                  if (!token) navigate("/login");
                  else setShowUserMenu(!showUserMenu);
                }}
                className="text-sm"
              >
                {token ? user?.name || "Profile" : "Login"}
              </span>
              <ChevronDown className="w-4 h-4 ml-1" />
              <AnimatePresence>
                {showUserMenu && token && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-10 w-48 py-2 bg-white border rounded shadow-lg z-50"
                  >
                    <div
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-pink-50"
                    >
                      My Profile
                    </div>
                    <div
                      onClick={() => {
                        navigate("/orders");
                        setShowUserMenu(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-pink-50"
                    >
                      My Orders
                    </div>
                    {user?.role === "admin" && (
                      <div
                        onClick={() => {
                          navigate("/admin");
                          setShowUserMenu(false);
                        }}
                        className="px-4 py-2 text-sm hover:bg-pink-50"
                      >
                        Admin Dashboard
                      </div>
                    )}
                    {user?.role === "digitalMarketer" && (
                      <div
                        onClick={() => {
                          navigate("/digitalMarketer");
                          setShowUserMenu(false);
                        }}
                        className="px-4 py-2 text-sm hover:bg-pink-50"
                      >
                        Marketer Dashboard
                      </div>
                    )}
                    <div
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center space-x-6 border-t py-3">
          {renderDropdown("Men", groupedCategories.Men)}
          {renderDropdown("Women", groupedCategories.Women)}
          {renderDropdown("Kids", groupedCategories.Kids)}
          {groupedCategories.Others.map((cat) => (
            <div
              key={cat._id}
              className="text-gray-700 hover:text-pink-600 cursor-pointer font-medium"
              onClick={() => navigateToCategory(cat._id)}
            >
              {cat.name}
            </div>
          ))}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t md:hidden"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-full"
                  />
                </form>

                {/* Mobile Navigation */}
                <div className="space-y-2">
                  <Link
                    to="/products?category=women"
                    className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Women
                  </Link>
                  <Link
                    to="/products?category=men"
                    className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Men
                  </Link>
                  <Link
                    to="/products?category=kids"
                    className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kids
                  </Link>
                  {(categories || [])
                    .filter(
                      (cat) =>
                        !cat.name.toLowerCase().includes("men") &&
                        !cat.name.toLowerCase().includes("women") &&
                        !cat.name.toLowerCase().includes("kids"),
                    )
                    .map((category) => (
                      <Link
                        key={category._id}
                        to={`/products/category/${category._id}`}
                        className="block py-2 font-medium text-gray-700 hover:text-pink-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-around pt-4 border-t">
                  <Link
                    to="/wishlist"
                    className="flex items-center space-x-1 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-pink-500 rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  {token ? (
                    <Link
                      to="/profile"
                      className="flex items-center space-x-1 text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm">Profile</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center space-x-1 text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm">Login</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
