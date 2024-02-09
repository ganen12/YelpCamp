const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", {allCampgrounds})
}

module.exports.renderNewCampgroundForm = (req, res) => {
    res.render("campgrounds/new.ejs")
}

module.exports.createCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // automatically adds the campground author based on who is CURRENTLY logged in
    await campground.save();
    req.flash("success", "Created new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
        .populate({path: "reviews", populate: { path: "author"}})
        .populate("author");
    if (!campground) {
        // req.flash("error", "Campground not found!")
        // return res.redirect("/campgrounds");
        return next(new ExpressError("Campground not found!. Might have been deleted", 404))
    }
    res.render("campgrounds/details.ejs", {campground, messages: req.flash("success")})
}

module.exports.renderEditCampgroundForm = async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "NO PERMISSION")
        return res.redirect(`/campgrounds/${id}`)
    }
    if (!campground) {
        return next(new ExpressError("Campground not found!. Might have been deleted", 404))
    }
    res.render("campgrounds/edit.ejs", {campground})
}

module.exports.updateCampground = async (req,res) => {
    const {id} = req.params;
    // the spread operator spreads it into separate object -> req.body.campground.title, req.body.campground.location, req.body.campground.price, etc 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true})
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    console.log("deleted", campground)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}