const express = require("express");
const router = express.Router();

// Import Course Controllers
const {
    createCourse,
    showAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    deleteCourse,
    getInstructorCourses,
} = require("../controllers/Course");

// Import Categories Controllers
const {
    createCategory,
    showAllcategories,
    categoryPageDetails
} = require("../controllers/Category");

// Import Section Controllers
const {
    createSection,
    updateSection,
    deleteSection
} = require("../controllers/Section");

// Import SubSection Controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require("../controllers/Subsection");

// Import Rating and Review Controllers
const {
    createRating,
    getAverageRating,
    getAllRating
} = require("../controllers/RatingAndReviews");

// Importing Middleware
const {auth, isStudent, isInstructor, isAdmin } = require("../middleware/auth");
const { updateCourseProgress } = require("../controllers/courseProgress");

// *******************************************************************
//                        Course routes
// *******************************************************************

// Courses can only be created by Instructor
router.post("/createCourse", auth, isInstructor, createCourse);
// Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update Section
router.post("/updateSection", auth, isInstructor, updateSection);
// Delete Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
// Update SubSection
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Create a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection);
// Get All registered Courses
router.get("/getAllCourses", showAllCourses);
// Get Details for a  specified Course
router.post("/getCourseDetails", getCourseDetails);
// Get Deatils for all coureses
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse);
// Get all Courses under a specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// Delete a Course
router.delete("/deleteCourse", deleteCourse);

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ******************************************************************
//                     Category Routes
// ******************************************************************
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllcategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ******************************************************************
//                          Rating and Review
// ******************************************************************

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
