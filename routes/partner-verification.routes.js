const express = require("express");
const router = express.Router();
const { createPartnerVerification, viewAllPartnerVerification, viewPartnerVerificationById, updatePartnerVerification, getPartnerInquiries } = require("../controllers/partner-verification.controller");
const { userValidateToken } = require("../middlewares/user.middleware");

router.post("/createPartnerVerification",createPartnerVerification);
router.get("/viewAllPartnerVerification", viewAllPartnerVerification);
router.get("/viewPartnerVerificationById/:id",viewPartnerVerificationById);
router.put("/updatePartnerVerification/:id",updatePartnerVerification);
router.get("/getPartnerInquiries",userValidateToken, getPartnerInquiries);

module.exports = router