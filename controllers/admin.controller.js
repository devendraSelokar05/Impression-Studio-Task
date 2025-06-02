const User = require("../models/postgres/user.model");
const PartnerVerification = require("../models/mongodb/partner-verification.model");
const Inquiry = require("../models/mongodb/inquiry.model");
const Portfolio = require("../models/mongodb/portfolio.model");

//
const getKPIs = async (req, res) => {
    try {
      const totalClients = await User.count({ where: { role: 'client' } });
      const totalPartners = await User.count({ where: { role: 'partner' } });
      const pendingVerifications = await PartnerVerification.countDocuments({ status: 'pending' });
      const totalInquiries = await Inquiry.countDocuments();
  
     return res.status(200).json({ success: true, totalClients, totalPartners, pendingVerifications, totalInquiries });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };

  //⭐ Promote Partner
const promotePartner = async (req, res) => {
   try {
    const { partnerId } = req.params;
    await Portfolio.updateOne({ partnerId }, { isFeatured: true });
   return res.status(200).json({ 
    success: true, 
    message: 'Partner promoted as featured',
    partnerId
 });
    
   } catch (error) {
    console.log(error)
    return res.status(500).json({
        success: false,
        message: "Failed to promote partner"
    })
   }
};
module.exports = {
    getKPIs,
    promotePartner
}