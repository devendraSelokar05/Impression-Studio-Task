const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
    clientId: Number,
    partnerId: Number,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;