const express = require("express");
const router = express.Router();

const {auth} = require("../middleware/auth");

const {
    login,
    signUp,
    sendOTP,
    changePassword
} = require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword
} = require("../controllers/ResetPassword");

// Routes for Login, SignUp, and Authentication

// *******************************************************************
//                 Authentication Routes
// *******************************************************************

// Route for user login
router.post("/login", login);

// Route for user signUp
router.post("/signUp", signUp);

// Route for sendOtp
router.post("/sendOtp", sendOTP);

// Route for changePassword
router.post("/changePassword", auth, changePassword);

// *******************************************************************
//                 Reset Password
// *******************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for reseting user's password after verfication
router.post("/reset-password", resetPassword);

// Export the router for use in the main application
module.exports = router;