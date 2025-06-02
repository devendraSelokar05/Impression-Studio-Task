const PartnerVerification = require("../models/mongodb/partner-verification.model");
const User = require("../models/postgres/user.model");
const Inquiry = require("../models/mongodb/inquiry.model");
const Category = require("../models/postgres/categories.model");


//⭐ Create partner verification
const createPartnerVerification = async (req, res) => {
    try {
      const {
        userId,
        personalDetails,
        serviceCategories,
        document,
        status,
        adminComment
      } = req.body;
  
      if (!userId || !personalDetails || !serviceCategories || !document || !status || !adminComment) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      // ✅ Check if user exists in PostgreSQL and is a 'partner'
      const user = await User.findByPk(userId);
      if (!user || user.role !== 'partner') {
        return res.status(400).json({ success: false, message: "Invalid partner userId" });
      }
  
      // Create the partner verification
      const partnerVerification = await PartnerVerification.create({
        userId,
        personalDetails,
        serviceCategories,
        document: { aadharNumber: document },
        status,
        adminComment
      });
  
      return res.status(201).json({
        success: true,
        message: "Partner verification created successfully",
        partnerVerification
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
    });
    }
  };


//⭐ View All Partner Verification
const viewAllPartnerVerification = async(req, res) =>{
    try {
        const partnerVerifications = await PartnerVerification.find();
        return res.status(200).json({
            success:true, 
            message:"View All Partner verifications fetched successfully",
            partnerVerifications
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

//⭐ View Partner Verification By Id
const viewPartnerVerificationById = async(req, res) =>{
    try {
        const partnerVerification = await PartnerVerification.findById(req.params.id);
        return res.status(200).json({
            success:true, 
            message:"View Partner verification fetched successfully",
            partnerVerification
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

//⭐ update Partern verification
const updatePartnerVerification = async (req, res) => {
  try {
      const { status } = req.body;
      const { id } = req.params;

      // Validate required fields
      if (!status) {
          return res.status(400).json({
              success: false,
              message: "Status is required"
          });
      }

      // Validate status value
      const validStatuses = ['pending', 'verified', 'rejected'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({
              success: false,
              message: "Invalid status. Must be one of: " + validStatuses.join(', ')
          });
      }

      // Prepare update object
      const updateData = { status };
      
      if(status =="verified"){
        updateData.adminComment = "Document verified successfully";
      }else if(status =="rejected"){
        updateData.adminComment = "The submitted documents did not meet the verification criteria.";
      }
    

      // Update the partner verification
      const partnerVerification = await PartnerVerification.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
      );

      if (!partnerVerification) {
          return res.status(404).json({
              success: false,
              message: "Partner verification not found"
          });
      }

      return res.status(200).json({
          success: true,
          message: `Partner verification updated successfully`,
          partnerVerification
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message:"failed to update partner verification: " + error.message
      });
  }
};


const getPartnerInquiries = async (req, res) => {
  try {
    const partnerId = Number(req.user.id);
    const role = req.user.role;
    const partnerCity = req.user.city; // assuming city is available in JWT or middleware

    if (role !== "partner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only partners allowed.",
      });
    }

    // Find inquiries where assignedPartnerIds includes this partner
    const inquiries = await Inquiry.find({ assignedPartnerIds: partnerId });

    // Format and enrich inquiries
    const enrichedInquiries = await Promise.all(
      inquiries.map(async (inquiry) => {
        // Get client
        const client = await User.findByPk(inquiry.clientId);
        const clientName = client ? client.name : "Unknown";

        // Get category
        const category = await Category.findByPk(inquiry.categoryId);
        const categoryName = category ? category.name : "Unknown";

        const dateObj = new Date(inquiry.date);
        const formattedDate = `${String(dateObj.getDate()).padStart(
          2,
          "0"
        )}/${String(dateObj.getMonth() + 1).padStart(
          2,
          "0"
        )}/${dateObj.getFullYear()}`;

        return {
          _id: inquiry._id,
          clientName,
          categoryName,
          date: formattedDate,
          budget: inquiry.budget,

          // ✅ Only return this partner's own city, not the full array
          city: partnerCity,

          referenceImageUrl: inquiry.referenceImageUrl,

          // ✅ Only show current partner's ID in the response
          assignedPartnerIds: partnerId,

          status: inquiry.status,
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedInquiries.length,
      inquiries: enrichedInquiries,
    });
  } catch (error) {
    console.error("Error in getPartnerInquiries:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching inquiries",
      error: error.message,
    });
  }
};

module.exports = {
    createPartnerVerification,
    viewAllPartnerVerification,
    viewPartnerVerificationById,
    updatePartnerVerification,
    getPartnerInquiries
}