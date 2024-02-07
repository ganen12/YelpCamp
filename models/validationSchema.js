const Joi = require('joi');
const Campground = require("../models/campground");

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
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "NO PERMISSION")
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports = {
    validateCampground,
    validateReview,
    requiredLogin,
    storeReturnTo,
    isAuthor
}