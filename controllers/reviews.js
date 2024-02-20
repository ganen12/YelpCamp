const Campground = require("../models/campground");
const Review = require("../models/review");

const renderIndex = (req, res) => {
    const {campID} = req.params;
    res.redirect(`/campgrounds/${campID}`)
}

const createReview = async (req, res) => { 
    const {campID} = req.params;
    const campground = await Campground.findById(campID)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}

const deleteReview = async (req, res ) => {
    const {campID, revID} = req.params;
    // this removes the id reference in campground.reviews first, and then delete the review from the separated collection
    const campground = await Campground.findByIdAndUpdate(campID, {$pull: {reviews: revID}}) // deletes the reviews._id reference
    const review = await Review.findByIdAndDelete(revID)
    console.log(`DELETED, ${review}, from: ${campground.reviews}`)
    res.redirect(`/campgrounds/${campground._id}`)
}


module.exports = {
    renderIndex,
    createReview,
    deleteReview
}