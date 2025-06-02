const express = require("express");
const router = express.Router();
const { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio, reorderEntries } = require("../controllers/portfolio.controller");
const { upload } = require("../services/cloudinary.service");
const { userValidateToken } = require("../middlewares/user.middleware");

router.post("/createPortfolio", upload.single("imageUrl"), userValidateToken, createPortfolio);
router.get("/getPortfolio", userValidateToken, getPortfolio);
router.put("/updatePortfolio", upload.single("imageUrl"), userValidateToken, updatePortfolio);
router.put("/reorderEntries/:partnerId", userValidateToken, reorderEntries);
router.delete("/deletePortfolio/:index", userValidateToken, deletePortfolio);

module.exports = router;