import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchInstructorCourses } from '../../../services/operations/courseDetailsAPI'
import IconButton from '../../common/IconButton'
import { IoIosAddCircleOutline } from "react-icons/io";
import CoursesTable from './InstructorCourses/CoursesTable';

const MyCourses = () => {

    const {token} = useSelector((state) => state.auth)
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
   
   useEffect(() => {
    const fetchCourses = async() => {
        const result = await fetchInstructorCourses(token);
       // console.log("result", result);
        if(result) {
            setCourses(result);
        }
    }
    fetchCourses();
   }, []);

  return (
    <div>
      <div className='flex justify-between items-center mb-14'>
        <h1 className='text-3xl font-medium text-richblack-5'>My Courses</h1>
        <IconButton
            text="Add Course"
            onClick={() => navigate("/dashboard/add-course")}

        >
            <IoIosAddCircleOutline size={20} /> 
        </IconButton>
      </div>

        {courses && <CoursesTable courses={courses} setCourses={setCourses} />}

    </div>
  )
}

export default MyCourses
