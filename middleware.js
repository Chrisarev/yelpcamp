const {campgroundSchema, reviewSchema} = require('./schemas.js') ///joi schema for JS object validation
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

///middleware for checking if user is logged in when trying to access routes
module.exports.isLoggedIn = (req,res,next) =>{
   // req.session.returnTo
    returnTo = req.originalUrl;    ///stores URL user requested before checking if logged in (returnTo defined as a req.locals in app.use)
    ///req.user put in by passport and contains deserialized information from session
    //console.log("REQ.USER..", req.user) 
    if(!req.isAuthenticated()){ 
        ///checks if user is signed in (passport method{checks information on session})
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next(); 
}

module.exports.validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body) ///checks to see if req.body follows schema (req.body should have campground object w given properties) returns error object if error
    if(error){   ///if req.body didnt follow Schema(no campground object found, some property missing, invalid input, etc)
        const msg = error.details.map(el => el.message).join(',') ///error.details is an array so we need to map it into a string, join is used if more than 1 detail msg
        throw new ExpressError(msg, 400) ///throws express error with result.error.details as message
    }else{
        next() ///allows route code to run if no error 
    }
}

module.exports.validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body) ///checks to see if req.body follows schema (req.body should have review object w given properties) returns error object if error
    if(error){   ///if req.body didnt follow Schema(no review object found, some property missing, invalid input, etc)
        const msg = error.details.map(el => el.message).join(',') ///error.details is an array so we need to map it into a string, join is used if more than 1 detail msg
        throw new ExpressError(msg, 400) ///throws express error with result.error.details as message
    }else{
        next() ///allow route code to run if no error 
    }
}

module.exports.isAuthor = async(req,res,next) =>{
    const {id} = req.params; 
    const campground = await Campground.findById(id); 
    if(!campground.author.equals(req.user._id)){ ///if user did not create the campground 
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next(); 
}

module.exports.isReviewAuthor = async(req,res,next) =>{
    ///id is campground id (route is /campgrounds/:id), reviewId comes from campgrounds show.ejs delete form
    const {id, reviewId} = req.params; 
    const review = await Review.findById(reviewId); 
    if(!review.author.equals(req.user._id)){ ///if user did not create the campground 
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next(); 
}