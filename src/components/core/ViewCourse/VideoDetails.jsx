import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';
import { updateCompletedLecture } from '../../../slices/viewCourseSlice';
import { BigPlayButton, Player } from 'video-react';
import 'video-react/dist/video-react.css';
import IconButton from '../../common/IconButton';

const VideoDetails = () => {

    const { courseId, sectionId, subSectionId} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const playerRef = useRef();
    const { token } = useSelector((state) => state.auth);
    const { courseSectionData, courseEntireData, completedLectures} = useSelector((state) => state.viewCourse); 
    const location = useLocation();

    const [videoData, setVideoData] = useState([]);
    const [videoEnded, setVideoEnded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewSource, setPreviewSource] = useState("");

    useEffect(() => {
      const setVideoSpecificData = async() => {
          if(!courseSectionData.length) 
            return;
          if(!courseId && !sectionId && !subSectionId){
            navigate("/dashboard/enrolled-courses");
          }
          else{
            //console.log("courseSectionData", courseSectionData)
            const filteredData = courseSectionData.find(
              (course) => course._id === sectionId
            )

            const filteredVideoData = filteredData?.subSection.find(
              (data) => data._id === subSectionId
            )
            //console.log("filtered video data : ", filteredVideoData)
            setVideoData(filteredVideoData);
            setPreviewSource(courseEntireData.thumbnail);
            setVideoEnded(false);
          }
      } 
      setVideoSpecificData();
    }, [courseSectionData, courseEntireData, location.pathname])

    const isFirstVideo = () => {
      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
      )
      if(currentSectionIndex === 0 && currentSubSectionIndex === 0){
        return true;
      }
      else{
        return false;
      }
    }

    const isLastVideo = () => {
      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const noOfSubSection = courseSectionData[currentSectionIndex].subSection.length;
      const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
      )

      if(currentSectionIndex === courseSectionData.length - 1 && 
        currentSubSectionIndex === noOfSubSection - 1){
          return true;
        }
        else{
          return false;
        }
    }

    const goToNextVideo = () => {
      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const noOfSubSection = courseSectionData[currentSectionIndex].subSection.length;

      const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
      )
      //console.log("no of subsections", noOfSubSection)
      if(currentSubSectionIndex !== noOfSubSection - 1) {
        // same section next video
        const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex + 1]?._id;
        navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
      }
      else{
        // different section first video
        const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
        const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
        navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`);
      }
    }

    const goToPreviousVideo = () => {
      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      const noOfSubSection = courseSectionData[currentSectionIndex].subSection.length;

      const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
        (data) => data._id === subSectionId
      )
      
      if(currentSubSectionIndex !== 0) {
        // same section previous video
        const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1]._id;
        navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
      }
      else{
        //different section last video
        const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
        const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
        const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;
        navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`);
      }
    }

    const handleLectureCompletion = async() => {
      setLoading(true);

      const res = await markLectureAsComplete({courseId: courseId, subSectionId: subSectionId}, token);
      //console.log("res in mark as complete: ", res);
      // state update
      if(res) {
        dispatch(updateCompletedLecture(subSectionId));
      }

      setLoading(false);
    }


  return (
    <div className='flex flex-col gap-5 text-white'>
      {
        !videoData ? (
          <img 
            src={previewSource}
            alt='Preview'
            className='h-full w-full rounded-md object-cover'
          />
        ) : (
          <Player
            ref={playerRef}
            aspectRatio='16:9'
            playsInline
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videourl}
          >
            <BigPlayButton position='center'/>
            {
              videoEnded && (
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgb(0,0,0), , rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                  }}
                  className='full absolute inset-0 z-[100] grid h-full place-content-center font-inter'
                >
                  {
                    !completedLectures.includes(subSectionId) && (
                      <IconButton 
                        disabled={loading}
                        onClick={() => handleLectureCompletion()}
                        text={!loading ? "Mark As Completed" : "Loading..."}
                        customClasses="text-xl max-w-max px-4 mx-auto"
                      />
                    )
                  }
                  <IconButton 
                    disabled={loading}
                    onClick={() => {
                      if(playerRef?.current) {
                        playerRef.current?.seek(0);
                        setVideoEnded(false);
                      } 
                    }}
                    text="Re-Watch"
                    customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                  />

                  <div className='mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl'>
                    {!isFirstVideo() && (
                      <button
                        disabled={loading}
                        onClick={goToPreviousVideo}
                        className='blackButton'
                      >
                        Prev 
                      </button>
                    )}
                    {!isLastVideo() && (
                      <button
                      disabled={loading}
                      onClick={goToNextVideo}
                      className='blackButton'
                      >
                        Next 
                      </button>
                    )}
                  </div>
                </div>
              )
            }
          </Player>
        )
      }
      <h1 className='mt-4 text-3xl font-semibold'>
        {videoData?.title}
      </h1>
      <p className='pt-2 pb-6'>
        {videoData?.description}
      </p>
    </div>
  )
}

export default VideoDetails
