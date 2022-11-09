const express = require('express'); 
const router = express.Router({mergeParams:true}); 
///router needs mergeParams or else params in app.js arent passed into router
const campgrounds = require('../controllers/campgrounds') ///campground.js controller file 
const catchAsync = require('../utils/catchAsync') ///our custom async error handler
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const multer  = require('multer'); ///require multer to parse images sent in forms 
const {storage} = require('../cloudinary'); ///require cloudinary config
const upload = multer({storage}) ///store uploaded images to cloudinary path in storage config 

///requires methods from middleware.js
const Campground = require('../models/campground') //require mongoose model campground.js
//require paths need .. instead of one because this file is inside of routes folder

router.route('/')
    .get(catchAsync(campgrounds.index))
    ///post from /campgrounds/new 
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    ///upload.array is multer passing image files to controller
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router; 