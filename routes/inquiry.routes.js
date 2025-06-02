const express = require("express");
const router = express.Router();
const { createInquiry, updateInquiryStatus, getAllMyInquiries, getInquiryById } = require("../controllers/inquiry.controller");
const { upload } = require("../services/cloudinary.service");
const { userValidateToken, roleCheck } = require("../middlewares/user.middleware");


router.post("/createInquiry", upload.single("referenceImageUrl"), createInquiry);
router.get("/getAllMyInquiries", userValidateToken,roleCheck(["client"]), getAllMyInquiries);
router.get("/getInquiryById/:id", userValidateToken,roleCheck(["client"]), getInquiryById); // Assuming this is the same as getAllMyInquiries for now
router.patch("/update-inquiryStatus/:id", userValidateToken, roleCheck(["partner"]), updateInquiryStatus);



module.exports = router;