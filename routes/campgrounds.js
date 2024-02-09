const express = require("express");
const router = express.Router();
const ExpressError = require("../utilities/ExpressError")
const catchAsync = require("../utilities/catchAsync");
const campgrounds = require("../controllers/campgrounds")
const Campground = require("../models/campground");
const {validateCampground, requiredLogin, isAuthor} = require("../models/validationSchema")

// read campgrounds
router.get("/", catchAsync(campgrounds.index))

router.get("/new", requiredLogin, campgrounds.renderNewCampgroundForm)

// create campground
router.post("/", requiredLogin, validateCampground, catchAsync(campgrounds.createCampground))

router.get("/:id", catchAsync(campgrounds.showCampground))

router.get("/:id/edit", requiredLogin, isAuthor, catchAsync(campgrounds.renderEditCampgroundForm))

// update campground
router.put("/:id", requiredLogin, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

// delete campground
router.delete("/:id", requiredLogin, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;