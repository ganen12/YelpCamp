const express = require("express");
const router = express.Router({mergeParams: true}); // merge params so that every type of params like variable is included
const ExpressError = require("../utilities/ExpressError")
const catchAsync = require("../utilities/catchAsync");
const Campground = require("../models/campground");
const {validateCampground, validateReview, requiredLogin} = require("../models/validationSchema")
const Review = require("../models/review");

router.get("/:campID/reviews", (req, res) => {
    const {campID} = req.params;
    res.redirect(`/campgrounds/${campID}`)
})

// delete a campground review
router.delete("/:campID/reviews/:revID", catchAsync(async (req, res ) => {
    const {campID, revID} = req.params;
    // this removes the id reference in campground.reviews first, and then delete the review from the separated collection
    const campground = await Campground.findByIdAndUpdate(campID, {$pull: {reviews: revID}}) // deletes the reviews._id reference
    const review = await Review.findByIdAndDelete(revID)
    console.log(`DELETED, ${review}, from: ${campground.title}`)
    res.redirect(`/campgrounds/${campID}`)
}))

// create a campground review
router.post("/:campID/reviews/", requiredLogin, validateReview, catchAsync(async (req, res) => { 
    const {campID} = req.params;
    const campground = await Campground.findById(campID)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

module.exports = router;