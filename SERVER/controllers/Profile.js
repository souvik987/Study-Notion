const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress")
const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
const {convertSecondsToDuration} = require("../utils/secToDuration")

exports.updateProfile = async (req, res) => {
    try {
        // get data
        const {
            firstName="",
            lastName="",
            dateOfBirth="", 
            about="", 
            contactNumber="", 
            gender = "",
        } = req.body;
        // get UserId
        const id = req.user.id;
        // validation
        // if(!contactNumber || !gender || !id) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'All fields are required',
        //     });
        // }
        // find profile
        const UserDetails = await User.findById(id);
        const profile = await Profile.findById(UserDetails.additionalDetails)

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        })
        await user.save();

        // update profile
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.gender = gender;
        profile.contactNumber = contactNumber;
        await profile.save();

        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()

        // return res
        return res.status(200).json({
            success: true,
            message: 'Profile Updated Successfully',
            updatedUserDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}

// deleteAccount
// explore -> how can we schedule this deletion operation

exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        console.log("printing Id :", id);
        // validation
        const UserDetails = await User.findById({_id: id});
        console.log(UserDetails)
        if(!UserDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }
        // delete profile
        await Profile.findByIdAndDelete({
            _id: new mongoose.Types.ObjectId(UserDetails.additionalDetails)});

        for (const courseId of UserDetails.courses) {
            await Course.findByIdAndUpdate(
                courseId,
                { $pull: {studentsEnrolled: id}},
                {new: true}
            )
        }
        // delete user
        await User.findByIdAndDelete({_id: id});
        // return res
        return res.status(200).json({
            success: true,
            message: 'User Deleted Successfully',
        })
        await CourseProgress.deleteMany({ userId: id})
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User Can not be deleted successfully',
        });
    }
};

exports.getAllUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.user.id;
        // validation and get user details
        const UserDetails = await User.findById(id).populate("additionalDetails").exec();
       // console.log(UserDetails);
        // return response
        return res.status(200).json({
            success: true,
            message: 'User Data fetched successfully',
            data: UserDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
    try {
        if (!req.files || !req.files.displayPicture) {
            throw new Error("No file uploaded.");
          }
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageCloudinary(
          displayPicture,
          process.env.FOLDER_NAME,
          1000,
          1000
        );
        //console.log(image);
        const updatedProfile = await User.findByIdAndUpdate(
          { _id: userId },
          { image: image.secure_url },
          { new: true }
        )
        res.send({
          success: true,
          message: `Image Updated successfully`,
          data: updatedProfile,
        })
      } catch (error) {
        //console.error(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        })
      }
}

// getEnrolledCourse
exports.getEnrolledCourses = async (req, res) => {
    try {
        // get id
        const userId = req.user.id;

        // validation and get all enrolled courses
        let UserDetails = await User.findOne({
            _id: userId,
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec()
        UserDetails = UserDetails.toObject()
        var Subsectionlength = 0
        for(var i = 0; i < UserDetails.courses.length; i++){
            let totalDurationInSeconds = 0
                Subsectionlength = 0;
            for(var j = 0; j < UserDetails.courses[i].courseContent.length; j++){
                totalDurationInSeconds += UserDetails.courses[i].courseContent[j].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                UserDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                Subsectionlength += UserDetails.courses[i].courseContent[j].subSection.length
            }
            let CourseProgressCount = await CourseProgress.findOne({
                courseID: UserDetails.courses[i]._id,
                userId: userId,
            })
            CourseProgressCount = CourseProgressCount?.completedVideos.length
            if(Subsectionlength === 0){
                UserDetails.courses[i].progressPercentage = 100
            }
            else {
                const multiplier = Math.pow(10, 2)
                UserDetails.courses[i].progressPercentage =
                    Math.round(
                        (CourseProgressCount / Subsectionlength) * 100 * multiplier
                    ) / multiplier
            }
            //console.log("Total Durations:", totalDurationInSeconds);
        }

        if (!UserDetails) {
            return res.status(400).json({
              success: false,
              message: `Could not find user with id: ${UserDetails}`,
            })
          }
        // return response
        return res.status(200).json({
            success: true,
            message: 'Enrolled Courses fetched successfully',
            data: UserDetails.courses

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({instructor: req.user.id })
        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,
            }
            return courseDataWithStats
        })
        res.status(200).json({ courses: courseData})
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" }) 
    }
}