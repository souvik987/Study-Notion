import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IoChevronBackCircleOutline } from "react-icons/io5";
import IconButton from '../../common/IconButton';
import { IoIosArrowDown } from "react-icons/io";

const VideoDetailsSidebar = ({setReviewModal}) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videobarActive, setVideobarActive] = useState("");
    const navigate = useNavigate();
    const {sectionId, subSectionId} = useParams();
    //console.log("sectionId", sectionId, "SubSectionId", subSectionId);
    const location = useLocation();
    const{
       courseSectionData,
       courseEntireData,
       totalNoOfLectures,
       completedLectures, 
    } = useSelector((state) => state.viewCourse);
    //console.log(courseSectionData);
    //console.log(totalNoOfLectures);
   // console.log(courseEntireData)

    useEffect(() => {
        ;(() => {
            if(!courseSectionData.length)
                return;
            const currentSectionIndex = courseSectionData.findIndex(
                (data) => data._id === sectionId
            )
            const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
                (data) => data._id === subSectionId
            )
            const activeSubSectionId = courseSectionData[currentSectionIndex]?.subSection?.[currentSubSectionIndex]?._id;
            //set current section here
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
            //set current sub-section here
            setVideobarActive(activeSubSectionId);          
        })()
    }, [courseSectionData, courseEntireData, location.pathname])

  return (
    <>
        <div className='flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800'>
            {/* for button and headings */}
            <div className='mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25'>
                {/* for buttons */}
                <div className='flex w-full items-center justify-between'>
                    <div
                        onClick={() => {
                            navigate("/dashboard/enrolled-courses")
                        }}
                        className='flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90'
                        title='back'
                    >
                        <IoChevronBackCircleOutline size={30} />
                    </div>

                    
                        <IconButton 
                            text="Add Review"
                            customClasses="ml-auto"
                            onClick={() => setReviewModal(true)}
                        />                   
                </div>
                {/* for headings */}
                <div className='flex flex-col'>
                    <p>{courseEntireData?.courseName}</p>
                    <p className='text-sm font-semibold text-richblack-300'>
                        {completedLectures?.length} / {totalNoOfLectures}
                    </p>
                </div>
            </div>

            {/* for sections and sub-sections */}
            <div className='h-[calc(100vh - 5rem)] overflow-y-auto'>
                {
                    courseSectionData?.map((section, index) => (
                        <div
                        className='mt-2 cursor-pointer text-sm text-richblack-5'
                        onClick={() => setActiveStatus(section?._id)}
                        key={index}
                        >
                            {/* section */}

                            <div className='flex flex-row justify-between bg-richblack-600 px-5 py-4'>
                                <div className='w-[70%] font-semibold'>
                                    {section?.sectionName}
                                </div>
                                <div className='flex items-center gap-3'>
                                    <span
                                      className={`${
                                        activeStatus === section?._id 
                                        ? "rotate-180" : "rotate-0"
                                      } transition-all duration-500`}
                                    >
                                        <IoIosArrowDown />
                                    </span>
                                </div>
                            </div>

                            {/* sub-section */}
                           
                                { activeStatus === section?._id && (
                                        <div className=' transition-[height] duration-500 ease-in-out'>
                                            {
                                                section.subSection?.map((topic, index) => (
                                                    <div
                                                    className={`flex gap-5 px-5 py-2
                                                     ${videobarActive === topic._id ? "bg-yellow-200 text-richblack-800 font-semibold" 
                                                     : " hover:bg-richblack-900"}`}
                                                     key={index}
                                                     onClick={() => {
                                                        navigate(`/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`)
                                                      setVideobarActive(topic._id)  
                                                     }}
                                                    >
                                                        <input 
                                                            type="checkbox" 
                                                            checked={completedLectures.includes(topic?._id)}
                                                            onChange={() => {}}    
                                                        />
                                                        <span className='ml-6'>
                                                            {topic.title}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                    ))
                }
            </div>
        </div>
      
    </>
  )
}

export default VideoDetailsSidebar
