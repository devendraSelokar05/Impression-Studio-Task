const Review = require("../models/mongodb/review.model");
const User = require("../models/postgres/user.model");

//✅ Add Reviews
const addReviews = async (req, res) => {
  try {
    const { clientId, partnerId, rating, comment } = req.body;
    if (!clientId || !partnerId || !rating || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const client = await User.findByPk(clientId);
    if (!client) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid client id" });
    }

    const partner = await User.findByPk(partnerId);
    if (!partner) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid partner id" });
    }

    const review = await Review.create({
      clientId,
      partnerId,
      rating,
      comment,
    });
    return res
      .status(201)
      .json({ success: true, message: "Review added successfully", review });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ View All Reviews
const viewAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    return res
      .status(200)
      .json({
        success: true,
        message: "Reviews fetched successfully",
        reviews,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ View Review By Id
const viewReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Review fetched successfully", review });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ Update Review
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res
      .status(200)
      .json({ success: true, message: "Review updated successfully", review });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ Delete Review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addReviews,
  viewAllReviews,
  viewReviewById,
  updateReview,
  deleteReview,
};
