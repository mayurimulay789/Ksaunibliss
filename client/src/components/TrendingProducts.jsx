"use client"

import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, Star, Play, Pause } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { addToCart, optimisticAddToCart, selectIsAddingToCart } from "../store/slices/cartSlice"
import {
  addToWishlist,
  removeFromWishlist,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist,
  selectIsAddingToWishlist,
  selectIsRemovingFromWishlist,
} from "../store/slices/wishlistSlice"
import toast from "react-hot-toast"
import { fetchTrendingProducts } from "../store/slices/productSlice"

const TrendingProducts = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { trendingProducts, isLoading, error } = useSelector((state) => state.products)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  const { user, token } = useSelector((state) => state.auth)
  const isAddingToCart = useSelector(selectIsAddingToCart)
  const isAddingToWishlist = useSelector(selectIsAddingToWishlist)
  const isRemovingFromWishlist = useSelector(selectIsRemovingFromWishlist)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [itemsPerView, setItemsPerView] = useState(4)

  const totalPages = Math.ceil(trendingProducts.length / itemsPerView)
  const maxIndex = Math.max(0, totalPages - 1)

  const getItemsPerView = () => {
    if (window.innerWidth < 768) return 2
    if (window.innerWidth < 1024) return 3
    return 4
  }

  useEffect(() => {
    const handleResize = () => setItemsPerView(getItemsPerView())
    window.addEventListener("resize", handleResize)
    setItemsPerView(getItemsPerView())
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (error) {
      toast.error("Failed to load trending products.")
    } else if (!isLoading && !trendingProducts.length) {
      dispatch(fetchTrendingProducts())
    }
  }, [dispatch, isLoading, error, trendingProducts.length])

  useEffect(() => {
    if (trendingProducts.length > 0 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [trendingProducts.length, isAutoPlaying, totalPages])

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCurrentIndex(0)
    }
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    } else {
      setCurrentIndex(maxIndex)
    }
    setIsAutoPlaying(false)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev)
  }

  // ✅ Enhanced handleAddToCart with optimistic updates
  const handleAddToCart = async (product) => {
    try {
      const rawSize = product.sizes?.[0]?.size || ""
      const size = rawSize.includes(",") ? rawSize.split(",")[0].trim() : rawSize
      const rawColor = product.colors?.[0]?.name || ""
      const color = rawColor.includes(",") ? rawColor.split(",")[0].trim() : rawColor

      const payload = {
        productId: product._id,
        quantity: 1,
        size: size || undefined,
        color: color || undefined,
      }

      // ✅ Optimistic update for immediate UI feedback
      dispatch(
        optimisticAddToCart({
          product,
          quantity: 1,
          size,
          color,
        }),
      )

      // ✅ Show immediate success feedback
      toast.success(`${product.name} added to cart!`)

      // ✅ Visual feedback on cart icon
      const bagElement = document.querySelector("#bag")
      if (bagElement) {
        bagElement.style.transform = "scale(1.2)"
        setTimeout(() => {
          bagElement.style.transform = "scale(1)"
        }, 200)
      }

      // ✅ Then sync with server
      await dispatch(addToCart(payload)).unwrap()
    } catch (err) {
      console.error("Add to cart error:", err)
      toast.error(err?.message || "Failed to add item to cart.")
    }
  }

  // ✅ Enhanced wishlist toggle with optimistic updates
  const handleWishlistToggle = async (product) => {
    try {
      const isInWishlist = wishlistItems.some((item) => item._id === product._id)

      if (isInWishlist) {
        // ✅ Optimistic remove
        dispatch(optimisticRemoveFromWishlist(product._id))
        toast.success(`${product.name} removed from wishlist!`)

        // ✅ Then sync with server
        await dispatch(removeFromWishlist(product._id)).unwrap()
      } else {
        // ✅ Optimistic add
        dispatch(optimisticAddToWishlist(product))
        toast.success(`${product.name} added to wishlist!`)

        // ✅ Then sync with server
        await dispatch(addToWishlist(product)).unwrap()
      }

      // ✅ Visual feedback on wishlist icon
      const wishElement = document.querySelector("#wish")
      if (wishElement) {
        wishElement.style.transform = "scale(1.2)"
        setTimeout(() => {
          wishElement.style.transform = "scale(1)"
        }, 200)
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err)
      toast.error(err?.message || "Failed to update wishlist.")

      // ✅ Error handling is now handled in the slice's rejected cases
    }
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Trending Now</h2>
            <p className="text-lg text-gray-600">Most popular items this week</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!trendingProducts.length && !isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Trending Now</h2>
          <p className="text-lg text-gray-600">No trending products available at the moment.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Trending Now</h2>
            <p className="text-lg text-gray-600">Most popular items this week</p>
          </div>
          <div className="hidden space-x-2 md:flex">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0 && !isAutoPlaying}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex && !isAutoPlaying}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {trendingProducts.map((product, index) => {
              const isInWishlist = wishlistItems.some((item) => item._id === product._id)
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                  className="flex-shrink-0 w-full px-3 md:w-1/2 lg:w-1/4"
                >
                  <div className="relative overflow-hidden transition-shadow duration-300 bg-white shadow-lg group rounded-2xl hover:shadow-xl">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.images[0]?.url || "/placeholder.svg?height=400&width=300"}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>
                      <div className="absolute flex flex-col space-y-2 top-3 left-3">
                        {product.tags.includes("new-arrival") && (
                          <span className="px-2 py-1 text-xs text-white rounded-full bg-ksauni-red">NEW</span>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="px-2 py-1 text-xs text-white rounded-full bg-ksauni-dark-red">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="absolute flex flex-col space-y-2 transition-opacity duration-300 opacity-0 top-3 right-3 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleWishlistToggle(product)}
                          disabled={isAddingToWishlist || isRemovingFromWishlist} // ✅ Disable during operations
                          className={`p-2 rounded-full shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isInWishlist
                              ? "bg-ksauni-red text-white"
                              : "bg-white text-gray-600 hover:bg-ksauni-red/5 hover:text-ksauni-red"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
                        </motion.button>
                      </div>
                      <div className="absolute transition-opacity duration-300 opacity-0 bottom-3 left-3 right-3 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart}
                          className="flex items-center justify-center w-full py-2 space-x-2 text-white transition-colors rounded-full bg-ksauni-red hover:bg-ksauni-dark-red disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{isAddingToCart ? "Adding..." : "Quick Add"}</span>
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-4">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="mb-2 font-semibold text-gray-800 transition-colors line-clamp-2 hover:text-ksauni-red">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating?.average || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">({product.rating?.count || 0})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={toggleAutoPlay}
              className="p-2 text-gray-700 transition-colors duration-300 rounded-full shadow-md bg-white/80 hover:bg-white"
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? "bg-ksauni-red" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/products?tag=trending"
            className="inline-block px-8 py-3 transition-colors border-2 rounded-full text-ksauni-red border-ksauni-red hover:bg-ksauni-dark-red hover:text-white"
          >
            View All Trending Products
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default TrendingProducts
