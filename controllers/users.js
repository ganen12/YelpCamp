const User = require("../models/user");

const renderRegisterForm = (req, res) => {
    res.render("users/register")
}

const registerUser = async (req,  res, next) => {
    try {
        const redirectUrl = req.query.origin || "/campgrounds"
        const {username, email, password} = req.body;
        const user = new User({username: username, email: email}); // this adds username and email first to the user instance
        const registeredUser = await User.register(user, password); // and then add the hashed password using static password method that was defined by Passport
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            res.redirect(redirectUrl)
        })
        
    } catch (error) {
        req.flash("error", error.message)
        res.redirect("/register")
    }   
}

const renderLoginForm = (req, res) => {
    res.render("users/login")
}

const loginUser = (req, res) => {
    const redirectUrl = res.locals.returnTo || req.query.origin; // forced to login || normal login
    delete req.session.returnTo;
    req.flash("success", "Welcome back")
    res.redirect(redirectUrl)
}

const logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success", "Logged Out")
        res.redirect("/campgrounds")
    });
}

module.exports = {
    renderRegisterForm,
    renderLoginForm,
    registerUser,
    loginUser,
    logoutUser
}