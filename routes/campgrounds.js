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

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

// read campgrounds
router.get("/", catchAsync(campgrounds.renderIndex));

router.get("/new", requiredLogin, campgrounds.renderNewForm)

// create campground 
router.post("/", requiredLogin, upload.array('image', 6), validateCampground, catchAsync(campgrounds.createCampground))

router.get("/:id", validID, catchAsync(campgrounds.renderDetails))

router.get("/:id/edit", validID, requiredLogin, isAuthor, catchAsync(campgrounds.renderEditForm))

// update campground
router.put("/:id", requiredLogin, isAuthor, upload.array('image', 6), validateCampground, catchAsync(campgrounds.updateCampground))

// delete campground
router.delete("/:id", requiredLogin, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;