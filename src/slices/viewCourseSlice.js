import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    courseSectionData: [],
    courseEntireData: [],
    completedLectures: [],
    totalNoOfLectures: 0,
}

const viewCouresSlice = createSlice({
    name: "viewCourse",
    initialState,
    reducers: {
        setCourseSectionData: (state, action) => {
            state.courseSectionData = action.payload
        },

        setEntireCourseData: (state, action) => {
            state.courseEntireData = action.payload
        },

        setTotalNoOfLecture: (state, action) => {
            state.totalNoOfLectures = action.payload
        },

        setCompletedLectures: (state, action) => {
            state.completedLectures = action.payload
        },

        updateCompletedLecture: (state, action) => {
            state.completedLectures = [...state.completedLectures, action.payload]
        },
    },
})

export const {
    setCourseSectionData,
    setEntireCourseData,
    setTotalNoOfLecture,
    setCompletedLectures,
    updateCompletedLecture,
} = viewCouresSlice.actions

export default viewCouresSlice.reducer