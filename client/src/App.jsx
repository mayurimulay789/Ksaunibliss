"use client"

import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store/store"
import NetworkStatus from "./components/NetworkStatus"
import { validateEnvironment, debugEnvironment } from "./utils/envValidation"

// Import simple preloader
import BewkoofStylePreloader from "./components/BewkoofStylePreloader"

// Import pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import ProfilePage from "./pages/ProfilePage"
import MyOrdersPage from "./pages/MyOrdersPage"
import WishlistPage from "./pages/WishlistPage"
import AboutUsPage from "./pages/Aboutus"
import ContactUsPage from "./pages/ContactUsPage"
import FAQPage from "./pages/FAQPage"
import PrivacyPage from "./pages/PrivacyPage"
import TermsPage from "./pages/TermsPage"
import SearchResultsPage from "./pages/SearchResultPage"
import ProductListingPage from "./pages/ProductListingPage"
import OrderConfirmationPage from "./pages/OrderConfirmationPage"
import ToastProvider from "./components/ToastProvider"

// Import admin pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import DigitalMarketerDashboard from "./pages/digitalMarketer/DigitalMarketerDashboard"

// Import components
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ProtectedRoute from "./components/ProtectedRoute"

// Import styles
import "./App.css"

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Add preloader class to body
    document.body.classList.add("preloader-active")

    // Validate environment variables on app startup
    const isValidEnvironment = validateEnvironment()
    if (!isValidEnvironment) {
      console.error("❌ Application cannot start due to missing environment variables")
      return
    }

    // Debug environment in development
    debugEnvironment()
    console.log("🚀 Fashion E-commerce App started successfully")

    // REMOVED session storage check - preloader will show every time
    // This ensures it always shows for the full duration
  }, [])

  const handlePreloaderComplete = () => {
    console.log("Preloader completed") // Debug log
    setIsLoading(false)
    setTimeout(() => {
      setShowContent(true)
      document.body.classList.remove("preloader-active")
    }, 100) // Small delay for smooth transition
  }

  // Always show preloader first
  if (isLoading) {
    return (
      <Provider store={store}>
        <BewkoofStylePreloader onComplete={handlePreloaderComplete} />
      </Provider>
    )
  }

  return (
    <Provider store={store}>

      <Router>
        <div className={`App transition-opacity duration-1000 ${showContent ? "opacity-100" : "opacity-0"}`}>
                    <ToastProvider />
              {/* <BewkoofStylePreloader onComplete={handlePreloaderComplete} /> */}

          <NetworkStatus />
          <main className="pt-2 main-content">
            <Navbar />
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:category" element={<ProductListingPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Protected Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Digital Marketer Routes */}
              <Route
                path="/digitalMarketer/*"
                element={
                  <ProtectedRoute requiredRole="digitalMarketer">
                    <DigitalMarketerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-white">404</span>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
                      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                      <a
                        href="/"
                        className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        ← Back to Home
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  )
}

export default App
