const express = require("express");
const router = express.Router();
const { addReviews, viewAllReviews, viewReviewById, updateReview, deleteReview } = require("../controllers/review.controller");
const { userValidateToken, roleCheck } = require("../middlewares/user.middleware");

router.post("/add-reviews", userValidateToken, addReviews);
router.get("/get-all-reviews", viewAllReviews);
router.get("/getReviewsById/:id", viewReviewById);

router.put("/updateReview/:id", userValidateToken, roleCheck(["admin"]), updateReview);
router.delete("/deleteReview/:id", userValidateToken, roleCheck(["admin"]), deleteReview);

module.exports = router;