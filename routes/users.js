const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo } = require("../models/validationSchema");

// authentication by Passport, Passport-local, Passport-local-mongoose
// const authenticate = (req, res, next) => {
//     passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"})
//     next()
// }

router.get("/register", (req, res) => {
    res.render("users/register")
})

router.post("/register", catchAsync(async (req,  res, next) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({username: username, email: email}); // this adds username and email first to the Model instance
        const registeredUser = await User.register(user, password); // and then add the hashed password using static password method that was defined by Passport
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            console.log(registeredUser);
            res.redirect("/campgrounds")
        })
        
    } catch (error) {
        req.flash("error", error.message)
        res.redirect("/register")
    }   
}))

router.get("/login", (req, res) => {
    res.render("users/login")
})

router.post("/login", storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res) => {
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    delete req.session.returnTo;
    req.flash("success", "Welcome back")
    res.redirect(redirectUrl)
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success", "Logged Out")
        res.redirect("/campgrounds")
    });

})

module.exports = router;