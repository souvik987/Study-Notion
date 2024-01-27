const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccess");
const CourseProgress = require("../models/CourseProgress");


    //intitiate the razorpay order
    exports.capturePayment = async(req ,res) => {

        const { courses } = req.body;
        const userId = req.user.id;

        if(courses.length === 0){
            return res.json({
                success: false,
                message: "Please provide course id",
            })
        }

        let totalAmount = 0;
        
        for(const course_id of courses) {
            let course;
            //console.log("Type of course_id", typeof(course_id));
            try {
                course = await Course.findById(course_id);
                //console.log("Course in capture payment", course);
                if(!course) {
                    return res.status(200).json({success:false, message: "Could not find the course."})
                }
                const uid = new mongoose.Types.ObjectId(userId);
                if(course.studentsEnrolled?.includes(uid)){
                    return res.status(200).json({success: false, message: "Student is already enrolled this course."})
                }
                totalAmount += course.price;
                //console.log("Total amount:", totalAmount);
            } catch (error) {
                console.log(error)
                return res.status(500).json({success: false, message: error.message})
            }
        }

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
        }

        try {
            const paymentResponse = await instance.orders.create(options)
            //console.log("payment",paymentResponse);
            res.json({
                success: true,
                message: paymentResponse,
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false, 
                message: "Could not initaite Order."
            })
        }
    }

    //verify the payment
    exports.verifyPayment = async(req, res) => {
         const razorpay_order_id = req.body?.razorpay_order_id;
         const razorpay_payment_id = req.body?.razorpay_payment_id;
         const razorpay_signature = req.body?.razorpay_signature;
         const courses = req.body?.courses;
         const userId = req.user.id;
        //  console.log("Razorpay Order id", razorpay_order_id);
        //  console.log("Razorpay Payment id: ", razorpay_payment_id);
        //  console.log("Razorpay Signature id", razorpay_signature);
        //  console.log("User Id: ", userId);

         if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId){
            return res.status(200).json({success: false, message: "Payment failed"})
         }

         let body = razorpay_order_id + "|" + razorpay_payment_id;
         //console.log("Body in payment: ", body);
         const expectedSignature = crypto
         .createHmac("sha256", process.env.RAZORPAY_SECRET)
         .update(body.toString())
         .digest("hex");
         //console.log("Expected signature:-", expectedSignature);
         if(expectedSignature === razorpay_signature) {
            //enroll the student
            await enrollStudents(courses, userId, res)
            // return res
            return res.status(200).json({success: true, message: "Payment verified"})
         }
         return res.status(200).json({success: false, message: "Payment failed"})
    }

    const enrollStudents = async(courses, userId, res) => {
        if(!courses || !userId) {
            return res.status(400).json({success: false, message: "Please provide data for courses or userId"})
        }
        
    for(const courseId of courses){
        try {
          //find the student and enroll the studnent in it 
          const enrolledCourse = await Course.findOneAndUpdate(
            {_id: courseId},
            {$push:{studentsEnrolled:userId}},
            {new: true},
          )
          
          if(!enrolledCourse) {
            return res.status(500).json({success: false, message: "Course not found."})
          }

          const courseProgress = await CourseProgress.create(
            {
                courseID: courseId,
                userId: userId,
                completedVideos:[],
            }
          )

          //find the student and add the course to their list of enrolled courses
          const enrolledStudent = await User.findByIdAndUpdate(userId, 
            {$push: {
                courses: courseId,
                courseProgress: courseProgress._id,
            }}, {new: true})

            // send the mail to the student 
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName} ${enrolledStudent.lastName}`)
            )
            //console.log("Email sent successfully", emailResponse);
            }
        catch(error) {
            console.log(error);
            return res.status(500).json({success: false, message: error.message})
        }
    }
    
        
    }

    exports.sendPaymentSuccessfulEmail = async(req, res) => {
        const {orderId, paymentId, amount} = req.body;

        const userId = req.user.id;

        if(!orderId || !paymentId || !amount || !userId) {
            return res.status(400).json({success: false, message: "Please provide all fields"})
        }

        try {
            // find the student
            const enrolledStudent = await User.findById(userId);
            await mailSender(
               enrolledStudent.email,
               `Payment Recieved`,
                paymentSuccessEmail(`${enrolledStudent.firstName} ${enrolledStudent.lastName}`),
                amount/100,orderId, paymentId
            )
        } catch (error) {
            console.log("error in sending mail", error)
            return res.status(300).json({success: false, message: "Could send the mail."})
        }
    }

// capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//     // get courseId and UserID
//     const {course_id} = req.body;
//     const userId = req.User.id;
//     // validation
//     // valid courseID
//     if(!course_id) {
//         return res.json({
//             success:false,
//             message:'Please provide valid course ID',
//         })
//     }
//     // valid courseDetails
//     let course;
//     try {
//         course = await Course.findById(course_id);
//         if(!course) {
//             return res.json({
//                 success: false,
//                 message: 'Could not find the course',
//             });
//         }

//         // user already pay for the same course
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)) {
//             return res.status(200).json({
//                 success: false,
//                 message:'Student is already enrolled',
//             })
//         }

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message:error.message,
//         })
//     }
    
//     // order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100,
//         currency,
//         receipt: Math.random(Date.now().toString()),
//         notes: {
//             cousreId: course_id,
//             userId,
//         }
//     };

//     try {
//         // initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);

//         // return response
//         return res.status(200).json({
//             success: true,
//             courseName: course.courseName,
//             courseDesription: course.courseDescription,
//             thumbnail: course.thumbail,
//             orderId: paymentResponse.id,
//             currency: paymentResponse.currency,
//             amount: paymentResponse.amount,
//         });

//     } catch (error) {
//         console.log(error);
//         res.json({
//             success: false,
//             message: 'Could not initiate order',
//         })
//     }
    
// };

// // varify signature of Razorpay and Server
// exports.verifySignature = async (req, res) => {
//     const webhookSecret = "12345678";

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest) {
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try {
//             // fullfil action

//             // find the course and enroll the student in it
//             const enrolledCourse = await Course.findByIdAndUpdate(
//                                              {_id: courseId},
//                                              {$push: {studentsEnrolled: userId}},
//                                              {new: true},
//             );

//             if(!enrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Course not Found',
//                 });
//             }

//             console.log(enrolledCourse);

//             // find the student and add the course to their list enrolled courses 
//             const enrolledStudent = await User.findOneAndUpdate(
//                                             {_id:userId},
//                                             {$push: {courses:courseId}},
//                                             {new: true},
//             );

//             console.log(enrolledStudent);

//             // confirmation mail send 
//             const emailResponse = await mailSender(
//                                         enrolledStudent.email,
//                                         "Congratulations from studyZone",
//                                         "Congratulations, you are onboarded into new Course",
//             );

//             console.log(emailResponse);
//             return res.status(200).json({
//                 success: true,
//                 message: 'Signature Verified and Course added',
//             })

//         } catch (error) {
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 message: error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid request',
//         });
//     }
// };