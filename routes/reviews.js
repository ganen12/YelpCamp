const express = require("express");
const router = express.Router({mergeParams: true}); // merge params so that every type of params like variable is included
const ExpressError = require("../utilities/ExpressError")
const catchAsync = require("../utilities/catchAsync");
const reviews = require("../controllers/reviews");
const {validateReview, requiredLogin, isReviewAuthor} = require("../models/validationSchema")


router.get("/:campID/reviews", reviews.renderIndex)

// delete a campground review
router.delete("/:campID/reviews/:revID", requiredLogin, isReviewAuthor, catchAsync(reviews.deleteReview))

// create a campground review
router.post("/:campID/reviews/", requiredLogin, validateReview, catchAsync(reviews.createReview))

module.exports = router;