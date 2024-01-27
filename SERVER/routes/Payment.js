const express = require("express");
const router = express.Router();

const {capturePayment, verifyPayment, sendPaymentSuccessfulEmail} = require("../controllers/Payment");
const {auth, isStudent, isInstructor, isAdmin } = require("../middleware/auth");

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifyPayment);
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessfulEmail);


module.exports = router;