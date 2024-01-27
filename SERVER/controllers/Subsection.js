const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageCloudinary } = require("../utils/imageUploader");


// create subSection
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const {sectionId, title, description} = req.body;
        // extract file/video
        const video = req.files.video
        // validation
        console.log(sectionId, title,  description);
        if(!sectionId || !title  || !description || !video) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        console.log(video)
        // upload video to cloudinary
        const uploadDetails = await uploadImageCloudinary(
            video, 
            process.env.FOLDER_NAME
            );

        console.log(uploadDetails);
        // create a subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration: `${uploadDetails.duration}`,
            description:description,
            videourl:uploadDetails.secure_url,
        })
        // update sections with this sub section Objected
        const updatedSection = await Section.findByIdAndUpdate      ({_id:sectionId},
            {$push:{
                subSection:subSectionDetails._id,
            }},
            {new:true}).populate("subSection");
        //Hw: log updated section here, after adding populate query
        // return response
        return res.status(200).json({
            success:true,
            message:'Sub Section created Successfully',
            updatedSection,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

//  update Subsection
exports.updateSubSection = async (req, res) => {
    try {
        const {sectionId, title, description, subSectionId} = req.body;

        const subSection = await SubSection.findById(subSectionId)

        if(!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if(title !== undefined) {
            subSection.title = title
        }

        if(description != undefined) {
            subSection.description = description
        }

        if(req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videourl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        // find updated section and return it
             const updatedSection = await Section.findById(sectionId).      
                                                     populate(
                                                     "subSection"
                ) 
        console.log("updated section", updatedSection)

        return res.status(200).json({
            success:true,
            message: 'Sub Section Updated Successfully',
            data: updatedSection,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}


// delete Subsection
exports.deleteSubSection = async (req, res) => {
    try {
        const {subSectionId, sectionId} = req.body;

        await Section.findOneAndUpdate(
            {_id: sectionId},
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        const subSection =  await SubSection.findByIdAndDelete({_id: subSectionId});
        if(!subSection) {
            return res
             .status(404)
             .json({ success: false, message: "SubSection not found" })
        }
        
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
          )

        return res.status(200).json({
            success:true,
            message:'Sub Section deleted successfully',
            data: updatedSection,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to delete Sub Section, please try again',
            error: error.message,
        })
    }
}