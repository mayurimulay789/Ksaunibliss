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
import FullTextSearchWithSuggestions from "./FullTextSearchWithSuggestions";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [productPreviews, setProductPreviews] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth || {});
  const { categories } = useSelector((state) => state.categories || {});
  const { items: cartItems } = useSelector((state) => state.cart || { items: [] });
  const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] });

  useEffect(() => {
    dispatch(fetchCategories({ showOnHomepage: true }));
  }, [dispatch]);

  const navigateToCategory = (categoryId = "") => {
    const base = "/products?priceRange=0%2C10000&sizes=&colors=&sortBy=newest";
    navigate(categoryId ? `${base}&category=${categoryId}` : base);
  };

  const groupedCategories = {
    Men: [],
    Women: [],
    Kids: [],
    Others: [],
  };

  (categories || []).forEach((cat) => {
    const name = cat.name.toLowerCase();
    if (name.includes("men") && !name.includes("women")) {
      groupedCategories.Men.push(cat);
    } else if (name.includes("women")) {
      groupedCategories.Women.push(cat);
    } else if (name.includes("kids")) {
      groupedCategories.Kids.push(cat);
    } else {
      groupedCategories.Others.push(cat);
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
      <div className="flex items-center space-x-1 font-medium text-gray-700 cursor-pointer hover:text-pink-600">
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
                  className="mb-2 text-sm font-semibold text-pink-600 cursor-pointer"
                >
                  {cat.name}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(productPreviews[cat._id] || []).map((prod) => (
                    <img
                      key={prod._id}
                      src={prod.images?.[0]?.url}
                      alt={prod.name}
                      className="object-cover w-16 h-16 transition rounded-md cursor-pointer hover:scale-105"
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
      <div className="container px-4 mx-auto uppercase">
        {/* Top Row */}
        <div className="flex items-center justify-between py-4">
          <div
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-red-600 cursor-pointer"
          >
            KsauniBliss
          </div>

          {/* Search */}
          <div className="justify-center flex-1 hidden max-w-md mx-10 md:flex">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim())
                  navigate(`/products?search=${searchQuery}`);
              }}
              className="relative w-full"
            >
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              {/* <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-500 rounded-full outline-none focus:border-red-500"
              /> */}
              <FullTextSearchWithSuggestions/>
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            {/* Wishlist */}
            <div
              onClick={() => navigate("/wishlist")}
              className="relative items-center hidden space-x-1 text-gray-700 cursor-pointer md:flex hover:text-pink-600"
            >
              <Heart className="w-5 h-5" />
              <span id="wish" className="text-sm">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-pink-500 rounded-full -top-2 -right-2">
                  {wishlistItems.length}
                </span>
              )}
            </div>

            {/* Cart */}
            <div
              onClick={() => navigate("/cart")}
              className="relative flex items-center space-x-1 text-gray-700 cursor-pointer hover:text-pink-600"
            >
              <ShoppingBag className="w-5 h-5" />
              <span id="bag" className="hidden text-sm md:block">Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                  {cartItems.reduce((t, i) => t + (i.quantity || 0), 0)}
                </span>
              )}
            </div>

            {/* Profile / Login */}
            <div className="relative items-center hidden text-gray-700 cursor-pointer md:flex hover:text-pink-600">
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
                    className="absolute right-0 z-50 w-48 py-2 mt-10 bg-white border rounded shadow-lg"
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
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="justify-center hidden py-3 space-x-6 border-t md:flex">
          {renderDropdown("Men", groupedCategories.Men)}
          {renderDropdown("Women", groupedCategories.Women)}
          {renderDropdown("Kids", groupedCategories.Kids)}
          {groupedCategories.Others.map((cat) => (
            <div
              key={cat._id}
              className="font-medium text-gray-700 cursor-pointer hover:text-pink-600"
              onClick={() => navigateToCategory(cat._id)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;