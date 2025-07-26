const express = require("express")
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  reportReview,
  getUserReviews,
} = require("../controllers/reviewController")
const { protect } = require("../middleware/auth")
const upload = require("../middleware/upload")

const router = express.Router()

// Public routes
router.get("/product/:id", getProductReviews) // ✅ Updated :productId -> :id for consistency

// Protected routes
router.use(protect)

router.post("/product/:id", upload.array("images", 5), createReview) // ✅ Uses :id param for productId in createReview
router.get("/user", getUserReviews)
router.put("/:reviewId", upload.array("images", 5), updateReview)
router.delete("/:reviewId", deleteReview)
router.post("/:reviewId/helpful", toggleHelpful)
router.post("/:reviewId/report", reportReview)

module.exports = router
