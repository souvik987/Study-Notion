const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const otpGenrator = require("otp-generator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

// sendOTP
exports.sendOTP = async (req, res) => {
    
    try {
        // fetch email from request body
    const {email} = req.body;

    // check if user already exist
    const checkUserPresent = await User.findOne({email});

    // if user already exist, then return a response
    if(checkUserPresent) {
        return res.status(401).json({
            success: false,
            message: 'User already registered',
        })
    }

    // generate OTP
    let otp = otpGenrator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    console.log("OTP generated: ", otp);

    // check unique otp or not
    const result = await OTP.findOne({otp: otp});

    while(result) {
        let otp = otpGenrator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        const result = await OTP.findOne({otp: otp});
    }

    const otpPayload = {email, otp};

    // create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successful
    res.status(200).json({
        success: true,
        message: 'OTP Sent Successfully',
        otp,
    })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
    
};

//sign Up
exports.signUp = async (req, res) => {

    try {
        // data fetch from request body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;
    // validate 
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
        return res.status(403).json({
            success: false,
            message: "All fields are required",
        })
    }
    // two password match
    if(password != confirmPassword){
        return res.status(400).json({
            success: false,
            message: 'Password and conirmPassword Value does not match, please try again'
        });
    }

    // check user already exist or not
    const existingUser = await User.findOne({email});
    if(existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User is already registered',
        });
    }

    // find most recent OTP stored for user
    const recentOtp = await OTP.find({email}).sort({createdAt: - 1}).limit(1);
    console.log(recentOtp);
    // validate OTP
    if(recentOtp.length == 0){
        // otp not found
        return res.status(400).json({
            success: false,
            message: 'OTP Not Found',
        })
    } else if(otp !== recentOtp[0].otp){
        //Invalid otp
        return res.status(400).json({
            success: false,
            message: 'Invalid OTP',
        })
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the user 
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    //Entry create in DB

    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        additionalDetails: profileDetails._id,
        image:`https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    //return res
    return res.status(200).json({
        success: true,
        message: 'User is registered Successfully',
        user,
    });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User can not registered. Please try again',
        })
        
    }

}


// Log in
exports.login = async (req, res) => {
     try {
       // get data from req body
       const {email, password} = req.body;
       // validation data
       if(!email || !password) {
        return res.status(403).json({
            success:false,
            message:'All fields are required, please try again',
        })
       }
       // user check exist or not 
       const user = await User.findOne({email}).populate("additionalDetails");
       if(!user) {
        return res.status(401).json({
            success: false,
            message: 'User is not registered, please signup first'
        })
       }
       // generate JWT, after password matching
       if(await bcrypt.compare(password, user.password)) {
        const payload = {
            email: user.email,
            id: user._id,
            accountType:user.accountType,
        }

        const token = JWT.sign(payload, process.env.JWT_SECRET, {
            expiresIn:"2h",
        });
        user.token = token;
        user.password = undefined;

        // create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
        }
        res.cookie("token", token, options).status(200).json({
            success:true,
            token,
            user,
            message:'Logged in successfully',
        })
       }
       else{
        return res.status(401).json({
            success:false,
            message:"Password is incorrect",
        });
       }
       
     } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure, Please try again',
        })
     }
}


// changePassword
exports.changePassword = async (req, res) => {
   try {
     // get data from req body
     const UserDetails = await User.findById(req.user.id);
    // get oldPassword, new Password, confirmedPassword
    const {oldPassword, newPassword} = req.body;
    // validation
    const isPasswordMatch = await bcrypt.compare(oldPassword, UserDetails.password);
    if(!isPasswordMatch) {
        return res.status(401).json({
            success:false,
            message:'The password is incorrect',
        });
    }
    // match newpassword and confirm new password
    // if(newPassword != confirmPassword) {
    //     return res.status(400).json({
    //         success:false,
    //         message:'The password and the confirmed password does not match',
    //     });
    // }
    // upadte pwd in DB
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(req.user.id, 
                                                            {password: encryptedPassword}, 
                                                            {new: true});
    // send mail - password upadte
    try {
        const emailResponse = await mailSender(updatedUserDetails.email, 
                                                passwordUpdated(
                                                    updatedUserDetails.email,
                                                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                                                ))
    console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
        console.log("Error occurred while sending email:", error);
        return res.status(500).json({
            success: false,
            message: 'Error occurred while sending email', 
            error:error.message,
        });
    }
    // return response
    return res.status(200).json({ 
        success: true, 
        message: "Password updated successfully" 
    });
   } catch (error) {
    console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
   }
}