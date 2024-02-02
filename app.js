const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Joi = require("joi");
const ejsMate = require('ejs-mate');
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const Campground = require("./models/campground");
const {validateCampground, validateReview} = require("./models/validationSchema")
const cities = require("./seeds/cities")
const catchAsync = require("./utilities/catchAsync");
const ExpressError = require("./utilities/ExpressError")
const methodOverride = require("method-override")
const Review = require("./models/review");
const campgroundRoutes = require("./routes/campgrounds");

mongoose.connect('mongodb://127.0.0.1:27017/terra-camp')
    .then(() => {
        console.log("CONNECTED TO DATABASE")
    })
    .catch (error => {
        console.log("Something went wrong", error);
  })
mongoose.connection.on("error", console.error.bind(console, "connection error")) // If there is an error during the connection process, this event will be triggered.


app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash())
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ // setting up session 
    secret: "thisismysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60* 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // the success message is stored in res.locals.success
    res.locals.error = req.flash("error");
    next();
})

app.use("/campgrounds", campgroundRoutes); // structuring better routing by separating it into different files (recommended)


// delete a campground review
app.delete("/campgrounds/:campID/reviews/:revID", catchAsync(async (req, res ) => {
    const {campID, revID} = req.params;
    // this removes the id reference in campground.reviews first, and then delete the review from the separated collection
    const campground = await Campground.findByIdAndUpdate(campID, {$pull: {reviews: revID}}) // deletes the reviews._id reference
    const review = await Review.findByIdAndDelete(revID)
    console.log("DELETED", review)
    res.redirect(`/campgrounds/${campID}`)
}))

// create a campground review
app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => { 
    const {id} = req.params;
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))


app.all("*", (req, res, next) => {
    throw new ExpressError("Page Not Found!", 404);
})

app.use((err, req, res, next) => {
    const status = err.status || 500; // default is 500 if no status argument passed
    res.status(status).render("errors/error.ejs", {err})
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
})
