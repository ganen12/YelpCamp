const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true}
});

// on hidden,
// this automatically adds other field for password, username, and some methods to the User Model
userSchema.plugin(passportLocalMongoose);  

const User = mongoose.model("User", userSchema);

module.exports = User;