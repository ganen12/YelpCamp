const Joi = require('joi');

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

module.exports = {
    validateCampground,
    validateReview
}