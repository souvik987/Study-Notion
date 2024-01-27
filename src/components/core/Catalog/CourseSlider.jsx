import React from 'react'
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { FreeMode, Pagination, Autoplay, Navigation} from 'swiper/modules'
import Course_Card from './Course_Card';

const CourseSlider = ({courses}) => {
  //console.log("Courses", courses);
  return (
    <>
      {
        courses?.length ? (
          <Swiper
            slidesPerView={1}
            loop={true}
            spaceBetween={25}
            modules={[Pagination, Autoplay, Navigation]}
            pagination={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            navigation={true}
            className='max-h-[30rem]'
            breakpoints={{
              1024:{slidesPerView:3,}
            }}
          >
            {
              courses?.map((course, index) => (
                <SwiperSlide key={index}>
                  <Course_Card course={course} Height={"h-[250px]"} />
                </SwiperSlide>
              ))
            }
          </Swiper>
        ) : (
          <p className='text-xl text-richblack-5'>No Course Found</p>
        )
      }
    </>
  )
}

export default CourseSlider
