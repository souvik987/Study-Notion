const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

// create Category Handler function

exports.createCategory = async(req, res) => {
    try {
        // fetch data
        const {name, description} = req.body;

        //validation
        if(!name){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })
        }
    // create entry in Db
    const categoriesDetails = await Category.create({
        name:name,
        description:description,
    });
      console.log(categoriesDetails);

      // return res

      return res.status(200).json({
        success: true,
        message: 'Category created Successfully',
      });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
}

// getAllCategories handler function

exports.showAllcategories = async (req, res) => {
    try {
       // console.log("INSIDE SHOW ALL CATEGORIES");
        const allCategories = await  Category.find({});
        res.status(200).json({
            success: true,
            message: 'All categories returned successfully',
            allCategories,
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
};

// categoryDetails
exports.categoryPageDetails = async (req, res) => {
    try {
        // get categoryId
        const {categoryId} = req.body;
        //console.log("PRINTING CATEGORY ID: ", categoryId);
        // get courses for specified category
        const selectedCategory = await Category.findById(categoryId)
                                                .populate({
                                                  path: "courses",
                                                 match: {status: "Published"},
                                                  populate: "ratingAndReviews",
                                                  })           
                                                  .exec();
        //console.log("Selected category: ",selectedCategory);

        // validation
        if(!selectedCategory) {
            console.log("category not found");
            return res.status(404).json({
                success:false,
                message: 'Category not found',
            });
        }
        // handle the case when there are no course
        if(selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
        }

        // get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: {$ne: categoryId },
        })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
        )
        .populate({
            path: "courses",
            match: {status: "Published" },
        })
        .exec()
        //console.log("Different COURSE", differentCategory)

        // get top-selling courses accross all categories
        const allCategories = await Category.find().populate({
                                                     path: "courses",
                                                     match: { status: "Published" },
                                                    populate: {
                                                      path: "instructor",
                    },
                })
          .exec()
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10);
       // console.log("mostSellingCourses COURSE", mostSellingCourses)

        res.status(200).json({
			success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
		});
    } catch (error) { 
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}