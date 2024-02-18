if (process.env.NODE_ENV !== "production") {
    require("dotenv").config(); // contains system variables depending on the environment. ex: API key, pass, name.
}
console.log(process.env.CLOUDINARY_KEY)

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
const catchAsync = require("./utilities/catchAsync");
const ExpressError = require("./utilities/ExpressError")
const methodOverride = require("method-override")
const Review = require("./models/review");
const User = require("./models/user");
const campgroundRoutes = require("./routes/campgrounds");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");
const passport = require("passport");
const LocalStrategy = require("passport-local"); 
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

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
app.use(session({ // set up session 
    name: "chocolatecookie", 
    secret: "thisismysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secureL: true,
        expires: Date.now() + 1000 * 60 * 60* 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(passport.initialize());
app.use(passport.session()); // sessions from Passport
app.use(mongoSanitize()); // sanitize req.body, req.params, etc.

// Content-Security-Policy header allows you to restrict which resources (JS, CSS, Images, etc.) can be loaded,
// and the URLs that they can be loaded from.
app.use(helmet({ contentSecurityPolicy: false })); // TODO: set true, then configure the content policy

passport.use(new LocalStrategy(User.authenticate())); // this tells passport to use a strategy for authentication and store it as a method in the User Model
passport.serializeUser(User.serializeUser()); // this makes a static method for User Model to store data in session 
passport.deserializeUser(User.deserializeUser()); // this makes a static method to unstore data in session 

// global variables available to all
app.use((req, res, next) => {        
    
    // redirecting from login/signup
    res.locals.origin = req.path;
    if (res.locals.origin === "/") { // if signed up from homepage
        res.locals.origin = "/campgrounds"
    }
    if (res.locals.origin === "/login" || res.locals.origin === "/register") { 
        res.locals.origin = req.query.origin;
    }

    res.locals.currentUser = req.user; // Passport property to store/check the user session data 
    res.locals.success = req.flash("success"); // the success message is stored in res.locals.success
    res.locals.error = req.flash("error");
    next();
})

// structuring better routing by separating it into different files
app.use("/campgrounds", campgroundRoutes); 
app.use("/campgrounds", reviewRoutes); 
app.use(userRoutes);

app.get("/", (req, res) => {
    res.render("home.ejs")
})

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

