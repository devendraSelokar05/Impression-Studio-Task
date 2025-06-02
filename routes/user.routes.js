const express = require("express");
const router = express.Router();
const { register, login, getUserProfile, getAllUsers, verifyOTP, resendOTP } = require("../controllers/user.controller");
const { userValidateToken } = require("../middlewares/user.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", userValidateToken, getUserProfile);
router.post("/verifyOTP", verifyOTP);
router.post("/resendOTP", resendOTP); // Assuming resendOTP is the same as verifyOTP for simplicity
router.get("/getAllUsers", getAllUsers);

module.exports = router;