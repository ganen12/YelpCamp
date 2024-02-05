const express = require("express");
const router = express.Router();
const ExpressError = require("../utilities/ExpressError")
const catchAsync = require("../utilities/catchAsync");
const Campground = require("../models/campground");
const {validateCampground, validateReview, requiredLogin} = require("../models/validationSchema")

// read campgrounds
router.get("/", catchAsync(async (req, res) => {
    console.log(req.user)
    const allCampgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", {allCampgrounds})
}))

router.get("/new", requiredLogin, (req, res) => {
    res.render("campgrounds/new.ejs")
})

// create campground
router.post("/", requiredLogin, validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // automatically adds the campground author based on who is CURRENTLY logged in
    await campground.save();
    req.flash("success", "Created new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get("/:id", catchAsync(async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id).populate("reviews").populate("author");
    if (!campground) {
        // req.flash("error", "Campground not found!")
        // return res.redirect("/campgrounds");
        return next(new ExpressError("Campground not found!. Might have been deleted", 404))
    }
    res.render("campgrounds/details.ejs", {campground, messages: req.flash("success")})
}))

router.get("/:id/edit", requiredLogin, catchAsync(async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        return next(new ExpressError("Campground not found!. Might have been deleted", 404))
    }
    res.render("campgrounds/edit.ejs", {campground})
}))

// update campground
router.put("/:id", requiredLogin, validateCampground, catchAsync(async (req,res) => {
    const {id} = req.params;
    // the spread operator spreads it into separate object -> req.body.campground.title and req.body.campground.location 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true})
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

// delete campground
router.delete("/:id", requiredLogin, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    console.log("deleted", campground)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}))

module.exports = router;