"use client"

import { useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, Play, Pause, Heart, ShoppingBag } from "lucide-react"
import { fetchNewArrivals } from "../store/slices/productSlice"
import { addToCart, optimisticAddToCart, selectIsAddingToCart } from "../store/slices/cartSlice"
import {
  addToWishlist,
  removeFromWishlist,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist,
  selectIsAddingToWishlist,
  selectIsRemovingFromWishlist,
} from "../store/slices/wishlistSlice"
import LoadingSpinner from "./LoadingSpinner"
import toast from "react-hot-toast"

const NewArrivals = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((state) => state.auth)
  const { newArrivals, isLoadingNewArrivals } = useSelector((state) => state.products)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  // ✅ Use selectors for better performance
  const isAddingToCart = useSelector(selectIsAddingToCart)
  const isAddingToWishlist = useSelector(selectIsAddingToWishlist)
  const isRemovingFromWishlist = useSelector(selectIsRemovingFromWishlist)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const itemsPerPage = 4
  const totalPages = Math.ceil(newArrivals.length / itemsPerPage) || 1

  useEffect(() => {
    dispatch(fetchNewArrivals())
  }, [dispatch])

  useEffect(() => {
    if (newArrivals.length > 0 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalPages)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [newArrivals.length, isAutoPlaying, totalPages])

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages)
    setIsAutoPlaying(false)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages)
    setIsAutoPlaying(false)
  }

  const toggleAutoPlay = () => setIsAutoPlaying((prev) => !prev)

  const startIndex = currentSlide * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const productsToShow = newArrivals.slice(startIndex, endIndex)

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
      toast.success(`${product.name} added to cart!`, {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "#4BB543",
          color: "#fff",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4BB543",
        },
      })

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
      toast.error(err?.message || "Failed to add item to cart", {
        duration: 3000,
        position: "bottom-right",
        style: {
          background: "#FF3333",
          color: "#fff",
        },
      })
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
    }
  }

  if (isLoadingNewArrivals) return <LoadingSpinner />

  return (
    <section className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900">New Arrivals</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Discover the latest fashion trends and must-have pieces that just landed in our collection.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {productsToShow.map((product, index) => {
                const discountPercentage =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0

                const isInWishlist = wishlistItems.some((item) => item._id === product._id)

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-xl group"
                  >
                    <div className="relative w-full overflow-hidden bg-gray-200 aspect-square">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.images?.[0]?.url || "/placeholder.svg?height=400&width=300"}
                          alt={product.name}
                          className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-0 left-0 px-3 py-1 text-xs font-semibold text-white rounded-br-lg bg-ksauni-red">
                        NEW
                      </div>
                      {discountPercentage > 0 && (
                        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold text-white rounded-bl-lg bg-ksauni-dark-red">
                          -{discountPercentage}%
                        </div>
                      )}

                      {/* ✅ Wishlist button - appears on hover */}
                      <div className="absolute flex flex-col space-y-2 transition-opacity duration-300 opacity-0 top-3 right-3 group-hover:opacity-100">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleWishlistToggle(product)}
                          disabled={isAddingToWishlist || isRemovingFromWishlist}
                          className={`p-2 rounded-full shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isInWishlist
                              ? "bg-ksauni-red text-white"
                              : "bg-white text-gray-600 hover:bg-ksauni-red/5 hover:text-ksauni-red"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
                        </motion.button>
                      </div>

                      {/* ✅ Quick add to cart button - appears on hover */}
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
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors line-clamp-2 hover:text-ksauni-red">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating?.average || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-500">({product.rating?.count || 0})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        {discountPercentage > 0 ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                        )}
                      </div>

                      {/* ✅ Enhanced action buttons */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="flex-1 px-4 py-2 text-sm font-medium text-center text-white transition-colors duration-200 rounded-md bg-ksauni-red hover:bg-ksauni-dark-red"
                        >
                          View Details
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(product)}
                          disabled={isAddingToCart}
                          className="flex-1 px-4 py-2 text-sm font-medium text-center transition-colors duration-200 border rounded-md text-ksauni-red border-ksauni-red hover:bg-ksauni-red hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingToCart ? "Adding..." : "Add to Cart"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          {totalPages > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPrevSlide}
                className="absolute left-0 z-10 p-2 transition-colors -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-100"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNextSlide}
                className="absolute right-0 z-10 p-2 transition-colors -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </motion.button>
            </>
          )}
        </div>

        {/* Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAutoPlay}
              className="p-2 text-gray-700 transition-colors duration-300 rounded-full shadow-md bg-white/80 hover:bg-white"
            >
              {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setCurrentSlide(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentSlide ? "bg-ksauni-red" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/products?filter=new"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-colors duration-200 rounded-md bg-ksauni-red hover:bg-ksauni-dark-red"
          >
            View All New Arrivals
            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default NewArrivals
