const Portfolio = require("../models/mongodb/portfolio.model");
const User = require("../models/postgres/user.model");

//⭐ Create Portfolio
const createPortfolio = async (req, res) => {
  try {
    const partnerId = req.user?.id;

    if (!partnerId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: Partner ID not found",
        });
    }

    // ✅ Confirm the user exists in PostgreSQL and is a partner
    const user = await User.findByPk(partnerId);
    if (!user || user.role !== "partner") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only partners can add portfolio entries",
        });
    }

    const { description, index } = req.body;
    const imageUrl = req.file?.path || req.body.imageUrl; // fallback if using URL directly

    if (!index || !description) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Both index and description are required",
        });
    }

    // Check if partner already has a portfolio
    let portfolio = await Portfolio.findOne({ partnerId });

    const newEntry = { imageUrl, description, index };

    if (!portfolio) {
      portfolio = new Portfolio({ partnerId, entries: [newEntry] });
    } else {
      portfolio.entries.push(newEntry);
    }

    await portfolio.save();

    return res.status(201).json({
      success: true,
      message: "Entry added",
      portfolio,
    });
  } catch (error) {
    console.error("Error adding entry:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//⭐ getPortfolio
const getPortfolio = async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: Partner ID not found",
        });
    }
    const portfolio = await Portfolio.findOne({ partnerId });
    if (!portfolio) {
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Portfolio fetched successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//⭐ update Portfolio
const updatePortfolio = async (req, res) => {
  try {
    const partnerId = req.user?.id;
    if (!partnerId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: Partner ID not found",
        });
    }

    const portfolio = await Portfolio.findOne({ partnerId });
    if (!portfolio) {
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });
    }

    const { index, description } = req.body;
    const imageUrl = req.file?.path || req.body.imageUrl;

    const entryIndex = portfolio.entries.findIndex(
      (entry) => entry.index === Number(index)
    );

    if (entryIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "No entry found with the provided index",
      });
    }

    const entry = portfolio.entries[entryIndex];

    if (description) entry.description = description;
    if (imageUrl) entry.imageUrl = imageUrl;

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//⭐ Reorder Portfolio
const reorderEntries = async (req, res) => {
  const { partnerId } = req.params;
  const { newOrder } = req.body; // array of indices: [3, 1, 2]

  try {
    const portfolio = await Portfolio.findOne({ partnerId });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: "Portfolio not found" });
    }

    if (!Array.isArray(newOrder)) {
      return res.status(400).json({ success: false, message: "Invalid newOrder format" });
    }

    portfolio.entries.sort((a, b) => newOrder.indexOf(a.index) - newOrder.indexOf(b.index));
    portfolio.entries.forEach((entry, i) => {
      entry.index = i + 1;
    });

    await portfolio.save();

    res.json({ success: true, message: "Entries reordered", portfolio });
  } catch (error) {
    console.error("Error reordering entries:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//⭐ delete Portfolio
const deletePortfolio = async (req, res) => {
  try {
    const partnerId = req.user?.id;

    if (!partnerId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: Partner ID not found",
        });
    }

    const { index } = req.params;

    if (index === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Index is required" });
    }

    const portfolio = await Portfolio.findOne({ partnerId });
    if (!portfolio) {
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });
    }

    const originalLength = portfolio.entries.length;
    portfolio.entries = portfolio.entries.filter(
      (entry) => entry.index !== Number(index)
    );

    if (portfolio.entries.length === originalLength) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Entry with index ${index} not found`,
        });
    }

    await portfolio.save();

    return res.status(200).json({
      success: true,
      message: `Portfolio Entry with index ${index} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  reorderEntries,
  deletePortfolio,
};
