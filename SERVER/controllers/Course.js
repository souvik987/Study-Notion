const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageCloudinary } = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const {convertSecondsToDuration} = require("../utils/secToDuration");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection");

// createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        
        // Get user ID from request object
        const userId = req.user.id;
        // fetch data 
        let {courseName,
             courseDescription,
             whatYouWillLearn,
             price,
             tag: _tag,
             category ,
            status, 
            instructions: _instructions,
            } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // convert the tag and instructions from stringfield Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions);
        
        //console.log("tag", tag);
       // console.log("instructions", instructions);

        //validation
        if(!courseName || 
           !courseDescription || 
           !whatYouWillLearn || 
           !price || 
           !tag.length || 
           !category || 
           !thumbnail ||
           !instructions.length) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        if (!status || status === undefined) {
			status = "Draft";
		}

        // check for instructor
        const instructorDetails = await User.findById(userId,
                                                      {
                                                        accountType:"Instructor",
                                                      });
        //console.log("Instructor Details: ", instructorDetails);
        // TODO: verify that userId and InstructorDetails are same or different

        if(!instructorDetails) {
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'Category Details not found',
            });
        }

        // upload Image to Cloudinary
        const thumbnailImage = await uploadImageCloudinary(thumbnail, process.env.FOLDER_NAME);

        //console.log(thumbnailImage);
         
        // create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions,
        });


        // add this new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        // update the Category schema
        await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        // return response
        return res.status(200).json({
            success:true,
            message: 'Course created successfully',
            data:newCourse,
        })  

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create course',
            error: error.message,
        })
    }
}

// Edit course details 
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if(!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If thumbnail Image is found, update it
        if(req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for(const key in updates) {
            if(updates.hasOwnProperty(key)) {
                if(key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else{
                    course[key] = updates[key]
                }
            }
        }

        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec()

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}


// getAllCourses handler function

exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({status: "Published" },
                                             { courseName:true,
                                                 price:true,
                                                 thumbail:true,
                                                 instructor:true,
                                                 ratingAndReviews:true,
                                                 studentsEnrolled:true,})
                                                 .populate("Instructor")
                                                 .exec();
        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Can not fetch course data',
            error: error.message,
        })
    }
}

// getCourse Details
exports.getCourseDetails = async (req, res ) => {
    try {
        // get id
        const {courseId} = req.body;
        // find course deatils 
        const getCourseDetails = await Course.findOne(
                                       {_id: courseId})
                                       .populate(
                                            {
                                                path: "instructor",
                                                populate: {
                                                    path: "additionalDetails",
                                                },
                                            }
                                     )
                                     .populate("category")
                                     .populate("ratingAndReviews")
                                     .populate({
                                        path: "courseContent",
                                        populate: {
                                            path:"subSection",
                                            select: "-videourl",
                                        },
                                     })
                                     .exec();
    
         // validation
         if(!getCourseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId} `,
            })
         }
         let totalDurationInSeconds = 0;
         getCourseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
         });
         console.log("total duration in: ", totalDurationInSeconds);

         const totalDuration = convertSecondsToDuration(totalDurationInSeconds)


         // return response
         return res.status(200).json({
            success: true,
            message: 'Course Details fetched successfully',
            data: {
                getCourseDetails,
                totalDuration,
            }
         })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
        const {courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          })
          .exec()
          let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
          })
      
         // console.log("courseProgressCount : ", courseProgressCount)
      
          if (!courseDetails) {
            return res.status(400).json({
              success: false,
              message: `Could not find course with id: ${courseId}`,
            })
          }  
          let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id
        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({createdAt: -1})
        res.status(200).json({
            success: true,
            data: instructorCourses,
          })
        } catch (error) {
          console.error(error)
          res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
          })
     }
}

// Delete the course
exports.deleteCourse = async (req, res) => {
    try {
        const {courseId} = req.body

        const course = await Course.findById(courseId)
        if(!course){ 
            return res.status(404).json({ message: "Course not found"})
        }

        const studentsEnrolled = course.studentsEnrolled
        for(const studentId of studentsEnrolled){
            await User.findByIdAndUpdate(studentId, {
                $pull: {courses: courseId},
            })
        }

        // Delete section and sub-section
        const courseSection  = course.courseContent
        for(const sectionId of courseSection){
           const section = await Section.findById(sectionId)
           if(section){
            const subSections = section.subSection
            for(const subSectionId of subSections) {
                await SubSection.findByIdAndDelete(subSectionId)
            }
           }
           await Section.findByIdAndDelete(sectionId)
        }

        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
     })
    }
}