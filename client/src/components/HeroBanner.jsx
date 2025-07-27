"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef(null)
  const { heroBanners } = useSelector((state) => state.banners)

  // Mouse tracking for parallax effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 700 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  // Scroll-based animations
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  useEffect(() => {
    if (heroBanners.length > 0 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [heroBanners.length, isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  }

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (delay) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: delay * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  }

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.95,
    },
  }

  // Fallback UI if no banners are available
  if (!heroBanners.length) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] bg-gray-900 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        }}
      >
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-white/5"></div> */}
          {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div> */}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8">
            <motion.div variants={textVariants} custom={0}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text mb-4 tracking-wider">
                LUXE
              </h1>
            </motion.div>

            <motion.p
              variants={textVariants}
              custom={1}
              className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 font-light tracking-wide max-w-md mx-auto lg:mx-0"
            >
              Elevate Your Style With
              <br />
              Luxury
            </motion.p>

            <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap">
              <Link
                to="/products"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-yellow-400 border border-yellow-400 rounded-none hover:bg-yellow-400 hover:text-black transition-all duration-300 tracking-wider uppercase"
              >
                Switch to Luxe
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Link>
            </motion.div>
          </div>

          {/* Right Content - Placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/60">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-yellow-400" />
              <p className="text-sm sm:text-base lg:text-lg">Discover Premium Fashion</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] bg-gray-900 overflow-hidden"
      style={{
        y,
        opacity,
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      }}
    >
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
        <img
    src="https://cmsimages.shoppersstop.com/J_and_J_web_d8ab3c4dbb/J_and_J_web_d8ab3c4dbb.png"
    alt="Hero Background"
  />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        {/* Left Content */}
        <motion.div
          className="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8 order-2 lg:order-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={textVariants} custom={0}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text mb-4 tracking-wider">
              LUXE
            </h1>
          </motion.div>

          <motion.p
            variants={textVariants}
            custom={1}
            className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 font-light tracking-wide max-w-md mx-auto lg:mx-0"
          >
            Elevate Your Style With
            <br />
            Luxury
          </motion.p>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible" whileHover="hover" whileTap="tap">
            <Link
              to="/products"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-yellow-400 border border-yellow-400 rounded-none hover:bg-yellow-400 hover:text-black transition-all duration-300 tracking-wider uppercase"
            >
              Switch to Luxe
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Image Carousel */}
        <div className="flex-1 relative h-full flex items-center justify-center order-1 lg:order-2 w-full">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
            {/* Main Image Display */}
            <motion.div
              key={currentSlide}
              className="relative h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] rounded-lg overflow-hidden border-2 sm:border-4 border-yellow-400 mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={heroBanners[currentSlide]?.image?.url || "/placeholder.svg?height=500&width=400"}
                alt={heroBanners[currentSlide]?.title || "Fashion Banner"}
                className="w-full h-full object-cover"
              />

              {/* Overlay with banner info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6">
                <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2">
                  {heroBanners[currentSlide]?.title || "Premium Collection"}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm md:text-base">
                  {heroBanners[currentSlide]?.description || "Discover luxury fashion"}
                </p>
              </div>
            </motion.div>

            {/* Navigation Controls */}
            {heroBanners.length > 1 && (
              <>
                {/* Left Arrow */}
                <motion.button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors duration-300 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </motion.button>

                {/* Right Arrow */}
                <motion.button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors duration-300 z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </motion.button>

                {/* Slide Indicators */}
                <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  {/* Auto-play toggle - Hidden on very small screens */}
                  <motion.button
                    onClick={toggleAutoPlay}
                    className="hidden sm:flex p-1.5 sm:p-2 text-yellow-400 border border-yellow-400 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isAutoPlaying ? (
                      <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </motion.button>

                  {/* Slide indicators */}
                  <div className="flex space-x-1 sm:space-x-2">
                    {heroBanners.map((_, index) => (
                      <motion.button
                        key={index}
                        className="relative"
                        onClick={() => setCurrentSlide(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <div
                          className={`w-6 sm:w-8 h-0.5 sm:h-1 rounded-full transition-all duration-300 ${
                            index === currentSlide ? "bg-yellow-400" : "bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>

                  {/* Slide counter */}
                  <div className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-yellow-400 border border-yellow-400 rounded-full">
                    {currentSlide + 1} / {heroBanners.length}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default HeroBanner
