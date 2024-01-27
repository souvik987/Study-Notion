const mailSender = require("../utils/mailSender");
const { contactUsEmail } = require("../mail/templates/contactFormRes");

exports.contactUs= async (req, res) => {
    const { email, firstName, lastName, message, phoneNo, countryCode} = req.body;
    //console.log(req.body);
    try {
        const emailRes = await mailSender(
            email,
            "Your Data send successfully",
            contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
        )
        //console.log("Email Res ", emailRes)
        return res.json({
            success: true,
            message: "Email send successfully",
        })
    } catch (error) {
        //console.log("Error ", error)
        //console.log("Error message : ", error.message)
        return res.json({
            success: false,
            message: "Something went wrong....",
        })
    }
}