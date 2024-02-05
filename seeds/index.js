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
                image: await "https://images.unsplash.com/photo-1518602164578-cd0074062767?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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