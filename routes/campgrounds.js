const express = require("express");
const router = express.Router();
const ExpressError = require("../utilities/ExpressError")
const catchAsync = require("../utilities/catchAsync");
const campgrounds = require("../controllers/campgrounds");
const Campground = require("../models/campground");
const {validateCampground, requiredLogin, isAuthor, validID} = require("../models/validationSchema")
const multer  = require('multer'); // configuration to upload images to Cloudinary
const {storage, cloudinary} = require("../cloudinary/index")
const upload = multer({storage/*, limits: { fileSize: 100000  bytes  }*/}); // upload to 
const sanitizeHtml = require('sanitize-html');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

// read campgrounds
router.get("/", catchAsync(async (req, res) => {
    const { q } = req.query;
    // Allow only a super restricted set of tags and attributes
    const clean = sanitizeHtml(q, {
    allowedTags: [ 'b', 'i', 'em', 'strong' ],
    allowedAttributes: {}});
    console.log("q: ", q)
    console.log("clean: ", clean)
    let allCampgrounds;
    if (clean) {
        allCampgrounds = await Campground.find({title: {$regex: clean.trim(), $options:'i'}})
    } else {
        allCampgrounds = await Campground.find({})
    }
    
    res.render("campgrounds/index.ejs", {allCampgrounds, q})
}));

router.get("/new", requiredLogin, (req, res) => {
    res.render("campgrounds/new.ejs")
})

// create campground 
router.post("/", requiredLogin, upload.array('image', 6), validateCampground, catchAsync(async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const images = req.files.map(file => { // map uploaded files data, make a copy with only url & filename 
        return { url: file.path, filename: file.filename }
    });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = images
    campground.author = req.user._id; // automatically adds the campground author based on who is CURRENTLY logged in
    await campground.save();
    console.log("ADDED: ", campground)
    req.flash("success", "Created new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

// router.post("/", upload.array('image'), (req, res, next) => {
//     console.log(req.body, req.files)
//     res.send("HEYY")
// })

router.get("/:id", validID, catchAsync(async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
        .populate({path: "reviews", populate: { path: "author"}})
        .populate("author");
    if (!campground) {
        return next(new ExpressError("Campground not found! Might have been deleted", 404))
    }
    return res.render("campgrounds/details.ejs", {campground, messages: req.flash("success")})
}))

router.get("/:id/edit", validID, requiredLogin, isAuthor, catchAsync(async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        return next(new ExpressError("Campground not found! Might have been deleted", 404))
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "NO PERMISSION")
        return res.redirect(`/campgrounds/${id}`)
    }
    
    res.render("campgrounds/edit.ejs", {campground})
}))

// update campground
router.put("/:id", requiredLogin, isAuthor, upload.array('image', 6), validateCampground, catchAsync(async (req,res) => {
    const {id} = req.params;
    const images = req.files.map(file => { // map uploaded files data, make a copy with only url & filename 
        return { url: file.path, filename: file.filename }
    });
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground, $push: {images: images}}, {runValidators: true})
    
    if (req.body.deleteImages) {
        await req.body.deleteImages.forEach(filename => {
            cloudinary.uploader.destroy(filename)
        });
        // removes the image that has filename IN req.body.deleteImages, because deleteImages is an array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    
    req.flash("success", "Suc cessfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

// delete campground
router.delete("/:id", requiredLogin, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    console.log("deleted", campground)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}))

module.exports = router;