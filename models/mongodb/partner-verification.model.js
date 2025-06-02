const mongoose = require('mongoose');

const PartnerVerificationSchema = new mongoose.Schema({
  userId: { type: Number, required: true }, 
  personalDetails: {
    phone: String,
    address: String
  },
  serviceCategories: [String],
  document: {
      aadharNumber: String
    },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  adminComment: String,

}, {
    timestamps: true,
    collection: 'partner_verifications', // use collection instead of tableName
    
});

const PartnerVerification = mongoose.model('PartnerVerification', PartnerVerificationSchema);

module.exports = PartnerVerification;
