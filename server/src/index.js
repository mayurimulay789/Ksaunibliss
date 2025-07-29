const dotenv = require("dotenv")
const path = require("path")

// Load environment variables first
dotenv.config({ path: path.resolve(__dirname, ".env") })

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")

const app = express()

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use("/api/", limiter)

// Debug environment variables (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 Environment Check:")
  console.log("NODE_ENV:", process.env.NODE_ENV)
  console.log("PORT:", process.env.PORT)
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Missing")
  console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing")
}

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check endpoints
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KsauniBliss API Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  })
})

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

// API Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/products", require("./routes/product"))
app.use("/api/categories", require("./routes/categories"))
app.use("/api/cart", require("./routes/cart"))
app.use("/api/orders", require("./routes/order"))
app.use("/api/reviews", require("./routes/review"))
app.use("/api/wishlist", require("./routes/wishlist"))
app.use("/api/coupons", require("./routes/coupon"))
app.use("/api/banners", require("./routes/banner"))
app.use("/api/returns", require("./routes/return"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/digital-marketer", require("./routes/digitalMarketer"))
app.use("/api/shiprocket", require("./routes/shiprocket"))

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message)

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development"

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDevelopment && {
      stack: err.stack,
      details: err,
    }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  }
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Database connection with retry logic
const connectDB = async () => {
  const maxRetries = 5
  let retries = 0

  while (retries < maxRetries) {
    try {
      const mongoURI = process.env.MONGODB_URI

      if (!mongoURI) {
        throw new Error("MONGODB_URI is not defined in environment variables")
      }

      console.log("🔄 Connecting to MongoDB...")

      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      console.log("✅ Connected to MongoDB")
      console.log("📊 Database:", mongoose.connection.name)
      break
    } catch (error) {
      retries++
      console.error(`❌ MongoDB connection attempt ${retries} failed:`, error.message)

      if (retries === maxRetries) {
        console.error("❌ Max retries reached. Exiting...")
        process.exit(1)
      }

      console.log(`⏳ Retrying in 5 seconds...`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

// MongoDB connection event handlers
mongoose.connection.on("disconnected", () => {
  console.log("📊 MongoDB disconnected")
})

mongoose.connection.on("reconnected", () => {
  console.log("📊 MongoDB reconnected")
})

// Connect to database
connectDB()

// Start server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`👋 ${signal} received, shutting down gracefully`)

  server.close(() => {
    console.log("🔌 HTTP server closed")

    mongoose.connection.close(false, () => {
      console.log("📊 MongoDB connection closed")
      process.exit(0)
    })
  })

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("❌ Could not close connections in time, forcefully shutting down")
    process.exit(1)
  }, 10000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err)
  gracefulShutdown("UNCAUGHT_EXCEPTION")
})

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err)
  gracefulShutdown("UNHANDLED_REJECTION")
})

module.exports = app
