const Joi = require('joi');
const Campground = require("../models/campground");
const Review = require("../models/review");
const ExpressError = require('../utilities/ExpressError');

const validateCampground = (req, res, next) => {
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            location: Joi.string().required(),
            image: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })

    const result = campgroundSchema.validate(req.body) // this passes req.body (campground) from the form into the schema, and then validate it

    if(result.error) { // if there is an error from validation above  
        throw new ExpressError(result.error.details.map(el => el.message).join(","), 400)
    } else {
        console.log("VALIDATION SUCCESS")
        next()
    }
}

const validateReview = (req, res, next) => {
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().min(1).max(5).required(),
            body: Joi.string().required()
        }).required()
    })

    const result = reviewSchema.validate(req.body) 

    if(result.error) { // if there is an error from validation above  
        throw new ExpressError(result.error.details.map(el => el.message).join(","), 400)
    } else {
        next()
    }
}

const requiredLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first.")
        return res.redirect("/login")
    }
    next()
}

// adds returnTo session data that contains previous URL to res locals variable
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) { // if there is a previous url before forced to login, store that previous url info to locals
        res.locals.returnTo = req.session.returnTo 
    }
    next()
}

// middleware to prevent editing from URL path manually or through API
const isAuthor = async (req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id);
    if (!campground.author._id.equals(req.user._id)) {
        req.flash("error", "NO PERMISSION")
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

const isReviewAuthor = async (req, res, next) => {
    const {campID, revID} = req.params
    const review = await Review.findById(revID);
    if (!review.author._id.equals(req.user._id)) {
        req.flash("error", "NO PERMISSION")
        return res.redirect(`/campgrounds/${campID}`)
    }
    next();
}


const validID = (req, res, next) => {
    const {id} = req.params
    if (id.match(/^[0-9a-fA-F]{24}$/)) { // MongoDB id standard validation
        return next()
    }
    next(new ExpressError("Campground not found! Invalid ID", 404))
}

module.exports = {
    validateCampground,
    validateReview,
    requiredLogin,
    storeReturnTo,
    isAuthor,
    isReviewAuthor,
    validID
}