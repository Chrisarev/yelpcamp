///RUN WITH NODE****
const mongoose = require('mongoose'); 
const cities = require('./cities.js')
const {places, descriptors} = require('./seedhelpers.js') ///creates places and descriptors array from seedhelpers.js 
const Campground = require('../models/campground') //require model campground.js

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser:true,
    useUnifiedTopology:true
});///creates db yelp-camp

const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
    console.log("Database Connected")
});///connects to db 


///func named sample that takes in array and return random element from that array
const sample = array => array[Math.floor(Math.random()*array.length)]; 

const seedDB = async () => {
    await Campground.deleteMany({}) ///deletes all campgrounds 
    for(let i =0;i<200;i++){ ///creates 50 campgrounds with random location 
        const random1000 = Math.floor(Math.random()*1000) ///picks one of the 1000 city objects in cities.js randomly 
        const price = Math.floor(Math.random()*20)+10; //random price
        const camp = new Campground({
            ///YOUR AUTHOR ID (IF YOUR USER IS DELETED, THIS NEEDS TO BE REPLACED)
            author: '630e58af057e159e10a73818',
            location:`${cities[random1000].city}, ${cities[random1000].state}`, ///random city/state from cities.js(city jSON object w city & state properties)
            title: `${sample(descriptors)} ${sample(places)}`, ///random descriptor + random place from seedHelpers.js 
            images: [
                {
                  url: 'https://res.cloudinary.com/dgz6d6j5h/image/upload/v1664310329/YelpCamp/hhpcrublbsbcm8p4zfdo.jpg',
                  filename: 'YelpCamp/hhpcrublbsbcm8p4zfdo',
                },
                {
                  url: 'https://res.cloudinary.com/dgz6d6j5h/image/upload/v1664310329/YelpCamp/ralq5kppx6q8nrp8if42.jpg',
                  filename: 'YelpCamp/ralq5kppx6q8nrp8if42',
                }
              ],
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deserunt quia iste aspernatur, quis numquam impedit inventore. Itaque in corporis dolorum porro tempore deleniti, quod, odio magnam officia vel quo necessitatibus.',
            price,
            geometry: {
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 

            }
        })   ///creates new Campground instance with random city and state from cities.js 
        await camp.save()
    }
}   ///deletes all campgrounds in db yelp-camp and creates campgrounds with 
    ///locations randomly 
seedDB().then(() => {
    mongoose.connection.close()
}); ///closes connection to mongoose (so node doesnt hang)
