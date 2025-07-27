"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Star, ThumbsUp, Plus, X, Filter, SortAsc, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { fetchProductReviews, likeReview } from "../store/slices/reviewSlice"
import { formatDistanceToNow } from "date-fns"
import reviewAPI from "../store/api/reviewAPI"
import { toast } from "react-toastify"

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch()
  const currentProductReviews = useSelector((state) => state.reviews?.currentProductReviews || [])
  const reviewStats = useSelector(
    (state) =>
      state.reviews?.reviewStats || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {},
      },
  )
  const loading = useSelector((state) => state.reviews?.loading || false)
  const { user } = useSelector((state) => state.auth)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filterRating, setFilterRating] = useState(0)
  const [sortBy, setSortBy] = useState("newest")
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    pros: "",
    cons: "",
  })
  const [images, setImages] = useState([])

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews(productId))
    }
  }, [dispatch, productId])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("productId", productId)
    formData.append("rating", reviewForm.rating)
    formData.append("title", reviewForm.title)
    formData.append("comment", reviewForm.comment)
    formData.append("pros", reviewForm.pros)
    formData.append("cons", reviewForm.cons)
    images.forEach((img) => formData.append("images", img))

    try {
      const { data } = await reviewAPI.createReview(formData)
      if (data.success) {
        toast.success("Review submitted!")
        setShowReviewForm(false)
        setReviewForm({ rating: 5, title: "", comment: "", pros: "", cons: "" })
        setImages([])
        dispatch(fetchProductReviews(productId))
      }
    } catch (error) {
      console.error("Review submit error:", error)
      toast.error("Failed to submit review")
    }
  }

  const handleLikeReview = (reviewId) => {
    if (!user) {
      toast.info("Please login to like reviews")
      return
    }
    dispatch(likeReview(reviewId))
  }

  const renderStars = (rating, size = "w-4 h-4", interactive = false, onStarClick = null) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onStarClick?.(star) : undefined}
          className={`${interactive ? "hover:scale-110 transition-transform cursor-pointer" : ""} focus:outline-none`}
          disabled={!interactive}
        >
          <Star
            className={`${size} transition-colors ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : interactive
                  ? "text-gray-300 hover:text-amber-200"
                  : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )

  const renderRatingDistribution = () => {
    const { ratingDistribution, totalReviews } = reviewStats
    return (
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 min-w-[60px]">
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 min-w-[30px] text-right">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const filteredAndSortedReviews = currentProductReviews
    .filter((review) => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        case "helpful":
          return (b.likes?.length || 0) - (a.likes?.length || 0)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading reviews...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Review Summary */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <div className="space-y-2">
                {renderStars(Math.round(reviewStats.averageRating), "w-6 h-6")}
                <div className="text-gray-600 font-medium">
                  Based on {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"}
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>All Ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Stars
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Write Review Button */}
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {showReviewForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showReviewForm ? "Cancel" : "Write Review"}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Share Your Experience</h3>
            <p className="text-gray-600 mt-1">Help others by writing a detailed review</p>
          </div>

          <form onSubmit={handleSubmitReview} className="p-8 space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Your Rating</label>
              {renderStars(reviewForm.rating, "w-8 h-8", true, (rating) => setReviewForm({ ...reviewForm, rating }))}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Review Title</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Summarize your experience..."
                required
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Share your detailed experience with this product..."
                required
              />
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Pros (Optional)
                </label>
                <textarea
                  value={reviewForm.pros}
                  onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                  placeholder="What did you like about this product?"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Cons (Optional)
                </label>
                <textarea
                  value={reviewForm.cons}
                  onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="What could be improved?"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Camera className="w-4 h-4 text-gray-500" />
                Add Photos (up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                </label>
              </div>
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(img) || "/placeholder.svg"}
                        alt={`Preview ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating, "w-4 h-4")}
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt))} ago
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.user?.name || "Anonymous"}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleLikeReview(review._id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {review.likes?.length || 0}
                </button>
              </div>

              {/* Review Content */}
              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {/* Pros and Cons */}
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {review.pros && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Pros</span>
                      </div>
                      <p className="text-sm text-green-700">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-800">Cons</span>
                      </div>
                      <p className="text-sm text-red-700">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Review Images */}
              {review.images?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img || "/placeholder.svg"}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductReviews
