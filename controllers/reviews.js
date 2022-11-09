const Campground = require('../models/campground') //require mongoose model campground.js
const Review = require('../models/review');

module.exports.createReview = async(req,res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); 
    review.author = req.user._id; ///sets author of review to current user
    ///inside of review submit form, name="review[property]" so we can just use req.body.review
    ///to create review 
    campground.reviews.push(review); ///adds review objectId to campground.reviews array
    await review.save();
    await campground.save(); 
    req.flash('success', 'Successfully added new review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req,res) =>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    ///find campground with id passed in, then $pull(remove) review in reviews arr containing reviewId
    await Review.findByIdAndDelete(reviewId) ///delete review
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}