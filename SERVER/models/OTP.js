const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplates");

const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60,
    },
});



// a function -> to send mail

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email, 
           "Verification Email from StudyNotion",
           emailTemplate(otp)
        )
        console.log("Email sent successfully: ", mailResponse.response);
    } catch (error) {
       console.log("Error occured while sending mails: ", error);
       throw error; 
    }
}

OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP", OTPSchema);