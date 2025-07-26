"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { fetchPromoBanners } from "../store/slices/bannerSlice"
import LoadingSpinner from "./LoadingSpinner"

// Utility function for countdown
const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date()
  let timeLeft = {}
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }
  return timeLeft
}

const PromoBanners = () => {
  const dispatch = useDispatch()
  const { promoBanners, isLoading } = useSelector((state) => state.banners)

  // Fetch promo banners on component mount
  useEffect(() => {
    dispatch(fetchPromoBanners())
  }, [dispatch])

  // Set a target date for the countdown
  const targetDate = "2024-12-13T00:00:00"
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  // Update countdown every second
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearTimeout(timer)
  })

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (promoBanners && promoBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % promoBanners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [promoBanners])

  // Prepare countdown timer components
  const timerComponents = []
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return
    }
    timerComponents.push(
      <div
        key={interval}
        className="flex flex-col items-center justify-center w-12 h-12 border rounded-lg bg-white/20 backdrop-blur-sm border-white/30"
      >
        <span className="text-lg font-bold text-white">{String(timeLeft[interval]).padStart(2, "0")}</span>
        <span className="text-xs uppercase text-white/80">{interval.slice(0, 3)}</span>
      </div>,
    )
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Get active banners or use default
  const activeBanners = promoBanners?.filter((banner) => banner.isActive) || []
  const defaultBanner = {
    _id: "default-deal",
    title: "SHOPPERS STOP",
    subtitle: "MIN. 30% OFF",
    description: "Discover amazing deals on premium fashion brands",
    image: { url: "/placeholder.svg?height=400&width=600&text=Fashion+Sale" },
    buttonText: "SHOP NOW",
    buttonLink: "/products?deal=true",
    brandLogo: "/placeholder.svg?height=60&width=120&text=BRAND",
  }

  const bannersToShow = activeBanners.length > 0 ? activeBanners : [defaultBanner]
  const currentBanner = bannersToShow[currentBannerIndex]

  return (
    <section className="py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Main Banner */}
        <motion.div
          key={currentBannerIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden shadow-2xl bg-gradient-to-r from-red-600 to-red-700 rounded-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            {/* Left Section - Product Image */}
            <div className="relative overflow-hidden">
              {/* Sale Badge */}
              <div className="absolute z-10 top-6 left-6">
                <div className="px-4 py-2 text-sm font-bold tracking-wide text-red-600 uppercase bg-white shadow-lg">
                  SALE
                </div>
              </div>

              {/* Product Image */}
              <div className="relative h-full min-h-[300px] lg:min-h-[400px]">
                <img
                  src={currentBanner.image?.url || "/placeholder.svg?height=400&width=600"}
                  alt={currentBanner.title || "Promotional Banner"}
                  className="absolute inset-0 object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-red-600/20"></div>
              </div>
            </div>

            {/* Right Section - Promotional Content */}
            <div className="flex flex-col justify-center p-8 text-white lg:p-12">
              {/* Brand Logo */}
              {currentBanner.brandLogo && (
                <div className="mb-6">
                  <img
                    src={currentBanner.brandLogo || "/placeholder.svg"}
                    alt="Brand Logo"
                    className="w-auto h-12 filter brightness-0 invert"
                  />
                </div>
              )}

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-4 text-4xl font-bold leading-tight lg:text-6xl"
              >
                {currentBanner.subtitle || "MIN. 30% OFF"}
              </motion.h1>

              {/* Description */}
              {currentBanner.description && (
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="max-w-md mb-6 text-lg text-white/90"
                >
                  {currentBanner.description}
                </motion.p>
              )}

              {/* Countdown Timer */}
              {timerComponents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex mb-8 space-x-3"
                >
                  {timerComponents}
                </motion.div>
              )}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link
                  to={currentBanner.buttonLink || "/products"}
                  className="inline-block px-8 py-4 text-lg font-bold tracking-wide text-red-600 uppercase transition-colors duration-300 transform bg-white shadow-lg hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1"
                >
                  {currentBanner.buttonText || "SHOP NOW"}
                </Link>
              </motion.div>

              {/* Offer Validity */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-4 text-sm text-white/70"
              >
                Offer valid until{" "}
                {new Date(targetDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Banner Indicators */}
        {bannersToShow.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {bannersToShow.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex ? "bg-red-600 w-8" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* Secondary Banners Grid */}
        
      </div>
    </section>
  )
}

export default PromoBanners
