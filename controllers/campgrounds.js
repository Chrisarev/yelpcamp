const catchAsync = require('../utils/catchAsync') ///our custom async error handler
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
///requires methods from middleware.js
//require paths need .. instead of one because this file is inside of routes folder
const Campground = require('../models/campground') //require mongoose model campground.js

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken}) //starts new mapbox client

const {cloudinary} = require('../cloudinary');

module.exports.index = async (req,res) =>{
    const campgrounds = await Campground.find({}) //all campground objects in campgrounds collection 
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req,res) =>{
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req,res,next) => {
    ///gets One geoJSON object using location entered by user
    /* -------- returns coords in longitude, latitude format-------- */
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send()
    ///if(!req.body.campground) throw new ExpressError('Invalid Campground Data, 400') 
    ///post request can still be send thru postman if mongoose model doesnt have required, so if req.body empty, throw error, which catchAsync catches
    const campground = new Campground(req.body.campground) 
    campground.geometry = geoData.body.features[0].geometry;
    //this is why input name is campground[title]/campground[location]...we only need 1 line of code 
    
    ///creates f object that contains url and filename for each image, stores them in campground
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    
    campground.author = req.user._id; ///sets author to current userId when creating
    await campground.save()
    console.log(campground)
    ///adds success flash message to req if campground is made w/o any errors
    req.flash('success', 'Successfully made new campground!')
    res.redirect(`/campgrounds/${campground._id}`) 
    //redirects need /campgrounds or else will add onto current URL 
    //flash message is sent to redirect route on req object
}

module.exports.showCampground = async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    ///finds campground with id given inside of URL(req.params)

    if (!campground){ ///if campground object retrieved from mongoDB is null(doesnt exist)
        req.flash('error', 'Cannot find that campground!') ///create error flash msg
        return res.redirect('/campgrounds') ///redirect back to campgrounds where flash will be thrown
    }
    ///populate after checking to see if campground is null 
    ///populate the reviews on campground and then populate the author of each review (review prop on campground is ObjectId,
    ///and author prop on review is ObjectId)
    await campground.populate({path:'reviews', populate:{path:'author'}}) 
    await campground.populate('author') ///populate author of campground 
    ///await needed or else form will be rendered before reviews is populated
    console.log(campground); 
    res.render('campgrounds/show', {campground})
}
module.exports.renderEditForm = async(req,res) =>{
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'Cannot find that campground'); 
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}
module.exports.updateCampground = async(req,res) =>{
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); ///array of image URLs/filenames
    campground.images.push(...imgs) ///adds images to campgound as strings by spreading imgs array
    await campground.save(); 
    ///uses mongoose updateOne method on selected campground to pull(delete) images inside of the campground images array
    ///that have a filename which matches a filename inside of the deleteImages array passed from edit form
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); 
        } ///deletes image from cloudinary
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground!') 
    ///campground object in req.body is spread, telling mongo to update properties 
    res.redirect(`/campgrounds/${campground._id}`) 
}
module.exports.deleteCampground = async(req,res) =>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}