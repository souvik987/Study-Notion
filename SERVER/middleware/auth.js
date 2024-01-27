const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token 
                      || req.body.token 
                      || req.header("Authorization")?.replace("Bearer ", "");


        // console.log("Token: ", token)
        // console.log("Cookies: ", req.cookies);
        // console.log("Body: ", req.body);
        // console.log("Authorization Header: ", req.header.authorization);

        // if token missing then return response
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }
        // verify the token 
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch (error) {
            console.error("JWT Verification Error:", error);
            // verification -issues
            return res.status(401).json({
               success: false,
               message: 'Token is invalid',
            })
            
        }
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        })
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        const UserDetails = await User.findOne({email: req.user.email});
        if(UserDetails.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for students only',
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role can not verified, please try again'
        })
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        const UserDetails = await User.findOne({email: req.user.email});
        if(UserDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for Instructor only',
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role can not verified, please try again'
        })
    }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        const UserDetails = await User.findOne({email: req.user.email});
        if(UserDetails.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'This is protected route for admin only',
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role can not verified, please try again'
        })
    }
}