import React, { useState } from 'react'
import {HomePageExplore} from "../../../data/homepage-explore";
import HighLightText from './HighLightText';
import CourseCard from './CourseCard';


const tabsName =[
    "Free",
    "New to coding",
    "Most popular",
    "Skills paths",
    "Career paths",
];

const ExploreMore = () => {

    const [currenttab, setCurrentTab] = useState(tabsName[0]);
    const [courses, setCourses] = useState(HomePageExplore[0].courses);
    const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading);

    const setMyCards = (value) => {
        setCurrentTab(value);
        const result = HomePageExplore.filter((courses) => courses.tag === value);
        setCourses(result[0].courses);
        setCurrentCard(result[0].courses.heading);
    }

  return (
    <div>
        <div>
        <div className='text-4xl font-semibold text-center my-10'>
            Unlock the
            <HighLightText text={"Power of Code"} />

            <p className=' text-center text-richblack-300 text-[16px] mt-1'>
             Learn to Build Anything You Can Imagine
            </p>

        </div>
        </div>

        <div className=' lg:flex hidden gap-5 rounded-full font-medium bg-richblack-800 mx-auto -mt-5 w-max border-richblack-200 px-1 py-1 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]'>
            {
                tabsName.map((element, index) => {
                    return (
                        <div
                        key={index}
                        className={`text-[16px] flex flex-row items-center gap-2 
                        ${currenttab === element 
                        ? "bg-richblack-900 text-richblack-5 font-medium" 
                        : "text-richblack-200"} rounded-full transition-all duration-200 cursor-pointer hover:bg-richblack-900 hover:text-richblack-5 px-7 py-2`}
                        onClick={() => setMyCards(element)}
                        >
                            {element}
                        </div>
                    )
                })
            }
        </div>

        <div className=' lg:h-[200px] lg:block hidden'> </div>

        {/* course card group */}

        <div className=' lg:absolute flex  gap-10 lg:gap-0 lg:justify-between justify-center flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3'>
            {
                courses.map((element, index) => {
                    return (
                        <CourseCard 
                        key={index}
                        cardData= {element}
                        currentCard = {currentCard}
                        setCurrentCard = {setCurrentCard}
                        />
                    )
                })
            }
        </div>
      
    </div>
  )
}

export default ExploreMore
