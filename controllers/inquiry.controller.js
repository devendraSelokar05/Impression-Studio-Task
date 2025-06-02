const Inquiry = require("../models/mongodb/inquiry.model");
const User = require("../models/postgres/user.model");
const Category = require("../models/postgres/categories.model");

//✅  Create new inquiry
const createInquiry = async (req, res) => {
  try {
    const {
      clientId,
      categoryId,
      date: dateString,
      budget,
      city,
      status,
    } = req.body;

    if (!clientId || !categoryId || !dateString || !budget || !city) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Parse and validate date (DD-MM-YYYY)
    let date;
    try {
      const [day, month, year] = dateString.split("-").map(Number);
      date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) throw new Error("Invalid date");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return res
          .status(400)
          .json({ success: false, message: "Date must be in the future" });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use DD-MM-YYYY format",
      });
    }

    // Validate client
    const client = await User.findByPk(clientId);
    if (!client || client.role !== "client") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid client Id" });
    }

    // Validate category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category Id" });
    }

    // Parse city input to array
    let cityArray;
    if (typeof city === "string") {
      try {
        cityArray = JSON.parse(city);
        if (!Array.isArray(cityArray)) throw new Error();
      } catch {
        // fallback to comma separated split
        cityArray = city.split(",").map((c) => c.trim());
      }
    } else if (Array.isArray(city)) {
      cityArray = city;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid city format" });
    }

    if (cityArray.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "City array cannot be empty" });
    }

    // Find partners whose city matches any of the cities in cityArray
    const partners = await User.findAll({
      where: {
        role: "partner",
        city: cityArray, // Sequelize will handle this as an IN query
      },
    });

    if (!partners.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No partners found for these cities",
        });
    }

    // Take top 3 partners (or fewer if less available)
    const assignedPartnerIds = partners
      .slice(0, 3)
      .map((p) => p.id)
      .filter(Boolean);

    // Optional image handling
    const image = req.file;
    const referenceImageUrl = image ? image.filename : "";

    // Validate status
    const allowedStatuses = ["new", "responded", "booked", "closed"];
    if (status && !allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid inquiry status" });
    }

    // Create inquiry with city as array
    const inquiry = await Inquiry.create({
      clientId,
      categoryId,
      date,
      budget,
      city: cityArray,
      referenceImageUrl,
      assignedPartnerIds,
      status: status || "new",
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry created and partners assigned successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Error in createInquiry:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ get my inquiries
const getAllMyInquiries = async (req, res) => {
  try {
    const clientId = req.user.id;
    const inquiries = await Inquiry.find({ clientId });
    
    // Format the date to DD-MM-YYYY
    const formattedInquiries = inquiries.map(inquiry => {
      const date = new Date(inquiry.date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return {
        ...inquiry._doc,
        date: `${day}-${month}-${year}`
      };
    });

    return res.status(200).json({ success: true, inquiries: formattedInquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//✅ get inquiry by id
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params; //inquiry id
    const userId = req.user.id;
    const userRole = req.user.role;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    // Only client (owner) or assigned partner can view
    if (
      (userRole === "client" && inquiry.clientId !== userId) ||
      (userRole === "partner" && !inquiry.assignedPartnerIds.includes(userId))
    ) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Format the date to DD-MM-YYYY
    const date = new Date(inquiry.date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const formattedInquiry = {
      ...inquiry._doc,
      date: `${day}-${month}-${year}`
    };

    return res.status(200).json({ success: true, inquiry: formattedInquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


//✅ update inquiry status
const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params; // inquiry id
    const { status } = req.body;
    const partnerId = req.user.id; // assuming JWT middleware sets req.user

    const allowedStatuses = ["responded", "booked", "closed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Find inquiry
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    // Check if this partner is assigned to this inquiry
    if (!inquiry.assignedPartnerIds.includes(partnerId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    inquiry.status = status;
    await inquiry.save();

    return res.status(200).json({ success: true, message: "Inquiry status updated", inquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  createInquiry,
  getAllMyInquiries,
  getInquiryById,
  updateInquiryStatus
};
