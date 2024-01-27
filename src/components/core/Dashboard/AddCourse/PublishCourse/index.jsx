import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import IconButton from '../../../../common/IconButton';
import { resetCourseState, setStep } from '../../../../../slices/courseSlice';
import { COURSE_STATUS } from '../../../../../utils/constants';
import { editCourseDetails } from '../../../../../services/operations/courseDetailsAPI';
import { useNavigate } from 'react-router-dom';

const PublishCourse = () => {
  
    const {register, handleSubmit, setValue, getValues} = useForm();
    const {course} = useSelector((state) => state.course)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth)
    const navigate = useNavigate();

    useEffect(() => {
      if(course?.status === COURSE_STATUS.PUBLISHED) {
        setValue("public", true);
      }
    })

    const goToCourses = () => {
      dispatch(resetCourseState());
      navigate("/dashboard/my-courses")
    }

    const handleCoursePublish = async () => {
      if(course?.status === COURSE_STATUS.PUBLISHED && getValues("public") === true || (course.status === COURSE_STATUS.DRAFT && getValues("public") === false)) {
        // no updation in form
        // no need to make api call
        goToCourses();
        return;
      } 

      // if form is updated 
      const formData = new FormData();
      formData.append("courseId", course._id);
      const courseStatus = getValues("public") ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT;
      formData.append("status", courseStatus);

      setLoading(true)
      const result = await editCourseDetails(formData, token);

      if(result) {
        goToCourses();
      }
      setLoading(false);
    }

    const onSubmit = () => {
      handleCoursePublish();
    }

    const goBack = () => {
      dispatch(setStep(2))
    }


  return (
    <div className='rounded-md border-[1px] bg-richblack-800 border-richblack-700 p-6'>
        <p className='text-2xl font-semibold text-richblack-5'>
          Publish Settings
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='my-6 mb-8'>
              <label htmlFor="public" className=' inline-flex items-center text-lg'>
              <input 
                type="checkbox" 
                id='public'
                {...register("public")}
                className=' rounded h-4 w-4 border-pure-greys-300 bg-richblack-500 text-richblack-400 focus:ring-2 focus:ring-richblack-5'
                />
                <span className='ml-2 text-richblack-400'>
                  Make this course as public
                </span>
                </label>
            </div>

            <div className='flex gap-x-4 ml-auto max-w-max items-center'>
              <button
                disabled={loading}
                type='button'
                onClick={goBack}
                className='flex items-center rounded-md gap-x-2 bg-richblack-300 cursor-pointer py-[8px] px-[20px] font-semibold text-richblack-900'
              >
                Back
              </button>
              <IconButton disabled={loading} text="Save Changes" />
            </div>
        </form>
    </div>
  )
}

export default PublishCourse

