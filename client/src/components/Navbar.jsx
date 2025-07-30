"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Search, ShoppingBag, User, Heart, Mic, Clock, Trash2 } from "lucide-react"
import { useDebounce } from "use-debounce"
import axios from "axios"
import { logout } from "../store/slices/authSlice"
import { fetchCategories } from "../store/slices/categorySlice"
import { fetchCart, selectCartTotalQuantity } from "../store/slices/cartSlice"
import { fetchWishlist, selectWishlistCount } from "../store/slices/wishlistSlice"
import {
  getSearchSuggestions,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "../store/slices/searchSlice"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredMenu, setHoveredMenu] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [productPreviews, setProductPreviews] = useState({})
  const [searchFocused, setSearchFocused] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const searchRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, token } = useSelector((state) => state.auth || {})
  const { categories } = useSelector((state) => state.categories || {})
  const { suggestions, recentSearches, suggestionsLoading } = useSelector((state) => state.search || {})

  // Use selectors for better performance
  const cartTotalQuantity = useSelector(selectCartTotalQuantity)
  const wishlistCount = useSelector(selectWishlistCount)

  // Debounce search query for suggestions
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)

  // Fetch cart and wishlist on component mount and when user changes
  useEffect(() => {
    if (token) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
    }
  }, [dispatch, token])

  useEffect(() => {
    dispatch(fetchCategories({ showOnHomepage: true }))
  }, [dispatch])

  // Fetch search suggestions when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim() && searchFocused) {
      dispatch(getSearchSuggestions(debouncedSearchQuery.trim()))
    }
  }, [debouncedSearchQuery, searchFocused, dispatch])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
        setSearchFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navigateToCategory = (categoryId = "") => {
    const base = "/products?priceRange=0%2C10000&sizes=&colors=&sortBy=newest"
    navigate(categoryId ? `${base}&category=${categoryId}` : base)
  }

  const groupedCategories = { Men: [], Women: [], Kids: [], Others: [] }
  ;(categories || []).forEach((cat) => {
    const name = cat.name.toLowerCase()
    if (name.includes("men") && !name.includes("women")) {
      groupedCategories.Men.push(cat)
    } else if (name.includes("women")) {
      groupedCategories.Women.push(cat)
    } else if (name.includes("kids")) {
      groupedCategories.Kids.push(cat)
    } else {
      groupedCategories.Others.push(cat)
    }
  })

  const fetchProductPreview = async (categoryId) => {
    if (!productPreviews[categoryId]) {
      try {
        const { data } = await axios.get(`/api/products?category=${categoryId}&priceRange=0%2C10000&page=1&limit=4`)
        if (data?.products) {
          setProductPreviews((prev) => ({
            ...prev,
            [categoryId]: data.products,
          }))
        }
      } catch (err) {
        console.error("Failed to load preview for category:", categoryId)
      }
    }
  }

  const renderDropdown = (label, categoryList) => (
    <div className="relative" onMouseEnter={() => setHoveredMenu(label)} onMouseLeave={() => setHoveredMenu(null)}>
      <div className="flex items-center space-x-1 font-medium text-gray-700 cursor-pointer hover:text-red-600">
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
              <div key={cat._id} className="mb-4" onMouseEnter={() => fetchProductPreview(cat._id)}>
                <div
                  onClick={() => navigateToCategory(cat._id)}
                  className="mb-2 text-sm font-semibold text-red-600 cursor-pointer"
                >
                  {cat.name}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(productPreviews[cat._id] || []).map((prod) => (
                    <img
                      key={prod._id}
                      src={prod.images?.[0]?.url || "/placeholder.svg"}
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
  )

  const handleLogout = () => {
    dispatch(logout())
    setShowUserMenu(false)
    navigate("/")
  }

  // ✅ Fixed search handler - navigate to /products with search param
  const handleSearch = (e, query = searchQuery) => {
    e?.preventDefault()
    const searchTerm = query.trim()
    if (searchTerm) {
      // Add to recent searches
      dispatch(addRecentSearch(searchTerm))

      // ✅ Navigate to products page with search query (not /search)
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`)

      // Close search dropdown and clear query
      setShowSearchDropdown(false)
      setSearchQuery("")
      setSearchFocused(false)
    }
  }

  // Handle search input focus
  const handleSearchFocus = () => {
    setSearchFocused(true)
    setShowSearchDropdown(true)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    handleSearch(null, suggestion)
  }

  // Handle recent search click
  const handleRecentSearchClick = (recentSearch) => {
    setSearchQuery(recentSearch)
    handleSearch(null, recentSearch)
  }

  const searchVariants = {
    focused: { scale: 1.02 },
    unfocused: { scale: 1 },
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <div className="container px-4 mx-auto uppercase">
        <div className="flex items-center justify-between py-4">
          <div onClick={() => navigate("/")} className="text-2xl font-bold text-red-600 cursor-pointer">
            KsauniBliss
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex justify-center flex-1">
            <motion.div
              ref={searchRef}
              className="relative w-full max-w-sm"
              variants={searchVariants}
              animate={searchFocused ? "focused" : "unfocused"}
            >
              <form onSubmit={handleSearch}>
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
                <motion.input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="w-full py-2 pl-10 pr-10 text-sm placeholder-gray-400 transition-all duration-300 border border-gray-200 rounded-full outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ksauni-red/20"
                  whileFocus={{ scale: 1.02 }}
                />
                <Mic className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-4 top-1/2" />
              </form>

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 z-50 mt-2 overflow-y-auto bg-white border rounded-lg shadow-lg top-full max-h-80"
                  >
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && !searchQuery && (
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">Recent Searches</h4>
                          <button
                            onClick={() => dispatch(clearRecentSearches())}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.map((search, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-50"
                              onClick={() => handleRecentSearchClick(search)}
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{search}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dispatch(removeRecentSearch(search))
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search Suggestions */}
                    {searchQuery && (
                      <div className="p-4">
                        {suggestionsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-ksauni-red animate-spin" />
                          </div>
                        ) : suggestions.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="mb-3 text-sm font-medium text-gray-700">Suggestions</h4>
                            {suggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <Search className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-sm text-center text-gray-500">No suggestions found</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="flex items-center space-x-6">
            <div
              onClick={() => navigate("/wishlist")}
              className="relative items-center hidden space-x-1 text-gray-700 cursor-pointer md:flex hover:text-red-600"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm" id="wish">
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </div>

            <div
              onClick={() => navigate("/cart")}
              className="relative flex items-center space-x-1 text-gray-700 cursor-pointer hover:text-red-600"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden text-sm md:block" id="bag">
                Cart
              </span>
              {cartTotalQuantity > 0 && (
                <motion.span
                  key={cartTotalQuantity}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2"
                >
                  {cartTotalQuantity}
                </motion.span>
              )}
            </div>

            <div className="relative items-center hidden text-gray-700 cursor-pointer md:flex hover:text-red-600">
              <User className="w-5 h-5 mr-1" />
              <span
                onClick={() => {
                  if (!token) navigate("/login")
                  else setShowUserMenu(!showUserMenu)
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
                        navigate("/profile")
                        setShowUserMenu(false)
                      }}
                      className="px-4 py-2 text-sm hover:bg-red-50"
                    >
                      My Profile
                    </div>
                    <div
                      onClick={() => {
                        navigate("/orders")
                        setShowUserMenu(false)
                      }}
                      className="px-4 py-2 text-sm hover:bg-red-50"
                    >
                      My Orders
                    </div>
                    {user?.role === "admin" && (
                      <div
                        onClick={() => {
                          navigate("/admin")
                          setShowUserMenu(false)
                        }}
                        className="px-4 py-2 text-sm hover:bg-red-50"
                      >
                        Admin Dashboard
                      </div>
                    )}
                    {user?.role === "digitalMarketer" && (
                      <div
                        onClick={() => {
                          navigate("/digitalMarketer")
                          setShowUserMenu(false)
                        }}
                        className="px-4 py-2 text-sm hover:bg-red-50"
                      >
                        Marketer Dashboard
                      </div>
                    )}
                    <div onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Logout
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
{/* added data  */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="justify-center hidden py-3 space-x-6 border-t md:flex">
          {renderDropdown("Men", groupedCategories.Men)}
          {renderDropdown("Women", groupedCategories.Women)}
          {renderDropdown("Kids", groupedCategories.Kids)}
          {groupedCategories.Others.map((cat) => (
            <div
              key={cat._id}
              className="font-medium text-gray-700 cursor-pointer hover:text-red-600"
              onClick={() => navigateToCategory(cat._id)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
