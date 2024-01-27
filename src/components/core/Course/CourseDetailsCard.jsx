import React from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom' 
import { RWebShare } from 'react-web-share'
import { BsFillCaretRightFill } from "react-icons/bs"
import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { FaShareSquare } from 'react-icons/fa'

function CourseDetailsCard({course, setConfirmationModal, handleBuyCourse}){

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()


  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course


  const handleAddToCart = () => {
     if(user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course")
      return
     }
     if(token) {
      dispatch(addToCart(course))
      return
     }
     setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add to cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
     })
  }

  return (
    <>
    <div className='flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5'>
      <img 
        src={ThumbnailImage} 
        alt={course?.courseName}
        className='max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full'
       />
       <div className='px-4'> 
          <div className=' space-x-3 pb-4 text-3xl font-semibold'>
            Rs. {CurrentPrice}
          </div>
          <div className='flex flex-col gap-4'>
            <button
              className='yellowButton'
              onClick={
                user && course?.studentsEnrolled.includes(user?._id)
                ? () => navigate("/dashboard/enrolled-courses")
                : handleBuyCourse
              }
            >
              {user && course?.studentsEnrolled.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"
              }
            </button>
            {(!user || !course?.studentsEnrolled.includes(user?._id)) && (
              <button onClick={handleAddToCart} className='blackButton'>
                Add to Cart 
              </button>
            )}
          </div>
          <div>
            <p className='pb-3 pt-6 text-center text-sm text-richblack-25'>
              30-Day Money-Back Guarantee 
            </p>
          </div>

          <div>
            <p className='my-2 text-xl font-semibold'>
              This Course Includes : 
            </p>
            <div className='flex flex-col gap-3 text-sm text-caribbeangreen-100'>
              {course?.instructions?.map((item, i) => {
                return (
                  <p className='flex gap-2' key={i}>
                     <BsFillCaretRightFill />
                     <span>{item}</span>
                  </p>
                )
              })}
            </div>
          </div>
          <div className='text-center'>
            <RWebShare
              data={{
                text: "Share this course",
                url: window.location.href,
                title: "Share",
              }}
            >
              <button
                onClick={() => {
                  toast.success("Shared successfully")
                }}
                className='mx-auto flex items-center gap-2 py-6 text-yellow-100'
              >
                <FaShareSquare size={15} /> Share 
              </button>
            </RWebShare>
          </div>
       </div>
    </div>
      
    </>
  )
}

export default CourseDetailsCard

