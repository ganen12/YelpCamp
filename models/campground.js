const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review")
const User = require("./user")

const imageSchema = new Schema({
    url: String, 
    filename: String
})

// create a virtual property to display thumbnail version of the image
imageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
})

const campgroundSchema = new Schema({
    title: {type: String },
    images: [imageSchema],
    price: {type: Number, default: 0},
    description: {type: String, default: " "},
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [ // one to many implementation
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// deletion middleware. Attached to the model
// the parameter takes what was deleted
campgroundSchema.post("findOneAndDelete", async function(data) {
    if(data) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews // deletes review IDs that is in the data that was deleted 
            }
        })
    }
})

const Campground = mongoose.model("Campground", campgroundSchema);


module.exports = Campground;