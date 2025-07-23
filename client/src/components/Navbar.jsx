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
import { logout } from "../store/slices/authSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import axios from "axios";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productPreviews, setProductPreviews] = useState({}); // cache

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.auth || {});
  const { categories } = useSelector((state) => state.categories || {});
  const { items: cartItems } = useSelector(
    (state) => state.cart || { items: [] }
  );
  const { items: wishlistItems } = useSelector(
    (state) => state.wishlist || { items: [] }
  );

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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <div className="container mx-auto px-4">
        {/* Top */}
        <div className="flex items-center justify-between py-4">
          <div
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-red-600 cursor-pointer"
          >
            KsauniBliss
          </div>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-full outline-none focus:border-pink-500"
              />
            </form>
          </div>
          <div className="flex items-center space-x-4">
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
            {token ? (
              <div
                onClick={() => navigate("/profile")}
                className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-pink-600 cursor-pointer"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.name || "Profile"}</span>
              </div>
            ) : (
              <div
                onClick={() => navigate("/login")}
                className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-pink-600 cursor-pointer"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Login</span>
              </div>
            )}
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

        {/* Main Menu */}
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
      </div>
    </motion.nav>
  );
};

export default Navbar;
