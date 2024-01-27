const mongoose = require("mongoose")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const Course = require("../models/Course")
const CourseProgress = require("../models/CourseProgress")

exports.updateCourseProgress = async (req, res) => {
    const { courseId, subSectionId} = req.body
    const userId = req.user.id
    //console.log("CourseId", courseId, "subsectionId", subSectionId);

    try {
        const subsection = await SubSection.findById(subSectionId)
        if(!subsection) {
            return res.status(400).json({ error: "Invalid subsection" })
        }

        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        if(!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course progress Does Not Exist",
              })
        } 
        else {
            if(courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({ error: "Subsection already completed" })
            }
            // push the subsection into completeVideos array
            courseProgress.completedVideos.push(subSectionId)
        }

        // Save the updated course progress
        await courseProgress.save();
        
        return res.status(200).json({ message: "Course progress updated" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" }) 
    }
}