import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { addCourseDetails, editCourseDetails, fetchCourseCategories } from "../../../../../services/operations/courseDetailsAPI";
import { HiOutlineCurrencyRupee } from 'react-icons/hi';
import RequirementField from './RequirementField ';
import IconBtn from "../../../../common/IconButton"
import toast from 'react-hot-toast';
import {setStep, setCourse} from "../../../../../slices/courseSlice";
import { COURSE_STATUS } from "../../../../../utils/constants";
import ChipInput from './ChipInput';
import Upload from '../Upload';
import { MdNavigateNext } from 'react-icons/md';

const CourseInformationForm = () => {

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: {errors},
  } = useForm();

  const dispatch = useDispatch();
  const {token} = useSelector((state) => state.auth);
  const {course, editCourse} = useSelector((state) => state.course);
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]) 

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const categories = await fetchCourseCategories()
      if (categories?.length > 0) {
        //console.log("categories", categories)
        setCourseCategories(categories)
      }
      setLoading(false);
      // try {
      //   const categories = await fetchCourseCategories();
  
      //   if (categories === undefined) {
      //     throw new Error("Failed to fetch data. Response is undefined.");
      //   }
  
      //   console.log("Categories from backend:", categories);
  
      //   if (!Array.isArray(categories)) {
      //     console.error("Fetched data:", categories);
      //     throw new Error("Categories are not provided in an array format");
      //   }
  
      //   if (categories.length === 0) {
      //     throw new Error("Categories array is empty");
      //   }
  
      //   setCourseCategories(categories);
      // } catch (error) {
      //   console.error("Error fetching or processing categories:", error);
      //   // Handle the error condition (e.g., displaying an error message)
      // } finally {
      //   setLoading(false);
      // }
    };

    if(editCourse) {
      setValue("courseTitle", course.courseName)
      setValue("courseShortDesc", course.courseDescription)
      setValue("coursePrice", course.price)
      setValue("courseTags", course.tag)
      setValue("courseBenefits", course.whatYouWillLearn)
      setValue("courseCategory", course.category)
      setValue("courseRequirements", course.instructions)
      setValue("courseImage", course.thumbnail)
    }

    getCategories();
  }, []) 

  //console.log("CourseCategory", course.category)

  const isFormUpdated = () => {
    const currentValues = getValues();
    if(currentValues.courseTitle !== course.courseName ||
      currentValues.currentShortDisc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseTags.toString() !== course.tag.toString() ||
      currentValues.courseBenefits!== course.whatYouWillLearn ||
      currentValues.courseCategory._id !== course.category._id ||
      currentValues.courseImage !== course.thumbnail || 
      currentValues.courseRequirements.toString() !== course.instructions.toString()
      )
      return true
    else
      return false
  } 

  // handle next button hit
  const onSubmit = async(data) => {

    if(editCourse){
      if(isFormUpdated()) {
        const currentValues = getValues();
      const formData = new FormData();

      formData.append("courseId", course?._id);
      if(currentValues.courseTitle !== course.courseName) {
        formData.append("courseName", data.courseTitle);
      }
      if(currentValues.courseShortDesc !== course.courseDescription) {
        formData.append("courseDescription", data.courseShortDesc);
      }
      if(currentValues.coursePrice !== course.price) {
        formData.append("price", data.coursePrice);
      }
      if(currentValues.courseBenefits !== course.whatYouWillLearn) {
        formData.append("whatYouWillLearn", data.courseBenefits);
      }
      if(currentValues.courseTags?.toString() !== course.tag?.toString()) {
        formData.append("tag", JSON.stringify(data.courseTags))
      }
      if(currentValues.courseCategory?._id !== course.category._id) {
        formData.append("category", data.courseCategory);
      }
      if(currentValues.courseRequirements?.toString() !== course.instructions?.toString()) {
        formData.append("instructions", JSON.stringify(data.courseRequirements));
      }
      if(currentValues.courseImage !== course.thumbnail){
        formData.append("thumbnailImage", data.courseImage)
      }

      setLoading(true);
      const result = await editCourseDetails(formData, token);
      setLoading(false);
      if(result){
        dispatch(setStep(2))
        dispatch(setCourse(result));
      }
      } 
      else{
        toast.error("No change made to the form");
      }
      return;
    }

    // create a new course
    const formData = new FormData();
    formData.append("courseName", data.courseTitle);
    formData.append("courseDescription", data.courseShortDesc);
    formData.append("price", data.coursePrice);
    formData.append("tag", JSON.stringify(data.courseTags))
    formData.append("whatYouWillLearn", data.courseBenefits);
    formData.append("category", data.courseCategory);
    formData.append("instructions", JSON.stringify(data.courseRequirements));
    formData.append("status", COURSE_STATUS.DRAFT);
    formData.append("thumbnailImage", data.courseImage);

    setLoading(true)
    const result = await addCourseDetails(formData, token);
    if(result) {
      dispatch(setStep(2))
      dispatch(setCourse(result));
    }
    setLoading(false)
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className='rounded-md border-richblack-700 bg-richblack-800 p-6 space-y-8'
    >
      <div className='flex flex-col space-y-2'>
        <label htmlFor="courseTitle" className='lable-style'>Course Title<sup className='text-pink-200'>*</sup></label>
        <input 
          type="text" 
          id='courseTitle'
          placeholder='Enter Course Title'
          {...register("courseTitle", {required: true})}
          className='form-style w-full'
          />
          {
            errors.courseTitle && (
              <span className='ml-2 text-xs tracking-wide text-pink-200'>Course Title is Required</span>
            )
          }
      </div>

      <div className='flex flex-col space-y-2'>
        <label htmlFor="courseShortDesc" className='lable-style'> Course Short Description<sup className=' text-pink-200'>*</sup></label>
        <textarea
          id="courseShortDesc" 
          placeholder='Enter Description'
          {...register("courseShortDesc", {required: true})}
          className='form-style resize-x-none min-h-[130px] w-full'
        />
        {
          errors.courseShortDesc && (<span className='ml-2 text-xs tracking-wide text-pink-200'>
            Course Description is required
          </span>)
        }
      </div>

      <div className='flex flex-col space-y-2'>
        <label htmlFor="coursePrice" className='lable-style'>Course Price<sup>*</sup></label>
        <div className=' relative'>
        <input 
          id='coursePrice'
          placeholder='Enter Course Price'
          {...register("coursePrice", {
            required: true,
            valueAsNumber: true,
            pattern: {
              value: /^(0|[1-9]\d*)(\.\d+)?$/,
            },
          })}
          className='form-style w-full !pl-12'
          />
          <HiOutlineCurrencyRupee className=' top-1/2 absolute left-3 inline-block -translate-y-1/2 text-2xl text-richblack-400'/>
          </div>
          {
            errors.coursePrice && (
              <span className='ml-2 text-xs tracking-wide text-pink-200'>Course Price is Required</span>
            )
          }
      </div>

      <div className='flex flex-col space-y-2'>
        <label htmlFor='courseCategory' className='lable-style'>Course Category<sup className='text-pink-200'>*</sup></label>
        <select 
         id="courseCategory"
         defaultValue=""
         {...register("courseCategory", {required: true})}
         className='form-style w-full'
         >
          <option value="" disabled>Choose a category</option>
          {
            !loading && courseCategories?.map((category, index) => (
              <option value={category?._id} key={index}>
                {category?.name}
              </option>
            ))
          }
         </select>
         {
          errors.courseCategory && (
            <span  className='ml-2 text-xs tracking-wide text-pink-200'>Course Category is required</span>
           )
         }
      </div>

         {/* Course Tags */}
      <ChipInput 
        label="Tags"
        name="courseTags"
        placeholder="Enter tags and press enter"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />

    {/* Course Thumbnail Image  */}
      <Upload 
        name="courseImage"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course?.thumbnail : null}
      />

      {/* Benefits of the course  */}
      <div className='flex flex-col space-y-2'>
        <label htmlFor="courseBenefits" className='lable-style'>Benefits of the course<sup className='text-pink-200'>*</sup></label>
        <textarea 
         id="courseBenefits" 
         placeholder='Enter Benefits of the course'
         {...register("courseBenefits", {required:true})}
         className='form-style w-full resize-x-none min-h-[130px]'
         />
          {errors.courseBenefits && (
            <span className='ml-2 text-xs tracking-wide text-pink-200'>
              Benefits of the course is required
            </span>
          )}
      </div>

      <RequirementField 
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />

      <div className='flex justify-end gap-x-2'>
        {
          editCourse && (
            <button
              onClick={() => dispatch(setStep(2))}
              disabled={loading}
              className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
            >
              Continue Without Saving 
            </button>
          )
        }

        <IconBtn
          disabled={loading}
          text={!editCourse ? "Next" : "Save Changes"}
        >
          <MdNavigateNext />
        </IconBtn>
      </div>

    </form>
  )
}

export default CourseInformationForm
