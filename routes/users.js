const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");
const users = require("../controllers/users");

const passport = require("passport");
const { storeReturnTo } = require("../models/validationSchema");

router.get("/register", users.renderRegisterForm)

router.post("/register", storeReturnTo, catchAsync(users.registerUser))

router.get("/login", users.renderLoginForm)

router.post("/login", storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), users.loginUser)

router.get("/logout", users.logoutUser)

module.exports = router;