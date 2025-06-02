const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  description: { type: String, default: "" },
  index: { type: Number, required: true }
});

const PortfolioSchema = new mongoose.Schema({
  partnerId: { type: Number, required: true, index: true }, // PostgreSQL user ID
  entries: [EntrySchema],
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

module.exports = Portfolio;
