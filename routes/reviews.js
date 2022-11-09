const express = require('express'); 
const router = express.Router({mergeParams:true}); 
///router needs mergeParams or else params in app.js arent passed into router
const reviews = require('../controllers/reviews')

const Campground = require('../models/campground') //require mongoose model campground.js
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync') ///our custom async error handler
const ExpressError = require('../utils/ExpressError')
const {validateReview, isReviewAuthor, isLoggedIn} = require('../middleware.js')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router; 