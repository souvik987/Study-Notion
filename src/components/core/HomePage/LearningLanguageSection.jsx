import React from 'react'
import HighLightText from './HighLightText';
import know_your_progress from "../../../assets/Images/Know_your_progress.png";
import compare_with_others from "../../../assets/Images/Compare_with_others.png";
import plan_your_lesson from "../../../assets/Images/Plan_your_lessons.png";
import CTAButton from "./Button";

const LearningLanguageSection = () => {
  return (
    <div className='lg:mt-[130px] mb-24'>
      <div className='flex flex-col gap-5 items-center'>

          <div className='text-4xl font-semibold text-center'>
            Your swiss Knife for
            <HighLightText text={"learning any language"} />
          </div>

          <div className='text-center text-richblack-600 mx-auto text-base font-medium lg:w-[60%]'>
          Using spin making learning multiple languages easy. with 20+ languages realistic voice-over, progress tracking, custom schedule and more.
          </div>

          <div className='flex lg:flex-row flex-col items-center justify-center lg:mt-0 mt-8'>
              <img 
              src={know_your_progress} 
              alt="KnowYourProgess" 
              className='object-contain lg:-mr-28'
              />

              <img 
              src={compare_with_others} 
              alt="CompareWithOthers" 
              className='object-contain lg:-mb-10 lg:-mt-0 -mt-12'
              />

              <img 
              src={plan_your_lesson} 
              alt="PlanYourLesson" 
              className='object-contain lg:-ml-36 lg:-mt-5 -mt-16'
              />
          </div>

          <div className='w-fit mx-auto mb-8 mt-10'>
            <CTAButton active={true} linkto={"/signup"}>
              <div>
                Learn More
              </div>
            </CTAButton>
          </div>

      </div>
    </div>
  )
}

export default LearningLanguageSection
