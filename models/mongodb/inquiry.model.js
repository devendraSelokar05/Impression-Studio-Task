const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema({
  clientId: { type: Number, required: true }, // PostgreSQL user ID
  categoryId: { type: Number, required: true }, // FK to categories.id
  date: Date,
  budget: Number,
  city: [{type: String, required: true}],
  referenceImageUrl: String,
  assignedPartnerIds: [Number],
  status: {
    type: String,
    enum: ['new', 'responded', 'booked', 'closed'],
    default: 'new'
  },

},{timestamps:true});

const Inquiry = mongoose.model('Inquiry', InquirySchema);

module.exports = Inquiry;
