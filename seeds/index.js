const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const Campground = require("../models/campground");
const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers.js");


mongoose.connect('mongodb://127.0.0.1:27017/terra-camp')
    .then(() => {
        console.log("CONNECTED TO DATABASE")
    })
    .catch (error => {
        console.log("Something went wrong", error);
  })

const rand = (max) => {
    return Math.floor(Math.random() * max);
} 

const seedDB = async () => {
    try {
        await Campground.deleteMany({});
        for (let i = 0; i < 50; i++) {
            const rand500 = rand(500);
            await Campground.create({
                location: `${cities[rand500].city}, ${cities[rand500].state}`,
                title: `${descriptors[rand(descriptors.length)]} ${places[rand(places.length)]}`,
                price: `${rand(20) + 10}`,
                geometry: {
                    type: "Point",
                    coordinates: [-113.1331, 47.0202]
                },
                images: [
                    {
                      url: 'https://res.cloudinary.com/dsdbdy97a/image/upload/v1707581407/YelpCamp/qh1ielvxmavdtxr7fxpa.jpg',
                      filename: 'YelpCamp/qh1ielvxmavdtxr7fxpa',
                    },
                    {
                      url: 'https://res.cloudinary.com/dsdbdy97a/image/upload/v1707581406/YelpCamp/cg66vgozrbsuzpxzci3e.jpg',
                      filename: 'YelpCamp/cg66vgozrbsuzpxzci3e',
                    }
                  ],
                description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quo laborum sequi quae expedita. Illum earum voluptatem obcaecati quaerat quibusdam quisquam quidem, doloribus, tenetur praesentium sequi illo placeat. Ratione, fugiat adipisci!",
                author: "65bf3c3011d0173e19d3e9e5" 
            })
        }
        
    } catch (error) {
        console.log("SOMETHING WENT WRONG", error)
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
        console.log("Connection Closed!")
    })