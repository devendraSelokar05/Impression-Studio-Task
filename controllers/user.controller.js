const User = require("../models/postgres/user.model");
const jwt = require("jsonwebtoken");

// Mock OTP service
const sendMockOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
  console.log(`Sending OTP ${otp} to ${email}`); // mock console log
  return otp;
};

// ✅ Register
const register = async (req, res) => {
  try {
    const { name, email, password, role, city } = req.body;
    if (!name || !email || !password || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otp = sendMockOTP(email);

    const user = await User.create({
      name,
      email,
      password,
      role,
      city,
      otp, 
      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: `${role} registered. OTP sent to email.`,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔒 Case 1: User registered but not verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "User is not verified. Please complete OTP verification during registration.",
      });
    }

 

    // ✅ Case 3: Fully verified user → Send token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      success: true,
      message: `Login successful. Welcome back ${user.name}`,
      token,
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};





//✅ Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ message: "OTP has expired" });
    }


   
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message:"OTP verified successfully. User is now verified.",
    });

  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


//✅ Resend OTP
const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isVerified) return res.status(400).json({ message: "User is already verified" });

  const otp = sendMockOTP(email);
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  return res.status(200).json({ message: "OTP resent to your email", otp });
};


//✅ Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  verifyOTP,
  resendOTP,
  getAllUsers,
};
