const mongoose = require('mongoose'); 
const Review = require('./review');
const Schema = mongoose.Schema; 
///set Schema variable just to shorten code

const ImageSchema = new Schema({
    url:String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200'); 
}) ///acts as if image URL's are stored in format needed to apply cloudinary thumbnail
   ///transformation 

const opts = {toJSON: {virtuals:true}};

const CampgroundSchema = new Schema({
    title:String, 
    images: [ImageSchema],
    geometry: { ///Following geoJSON standards 
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price:Number, 
    description:String, 
    location:String,
    author:{ ///reference to a User object
        type: Schema.Types.ObjectId, 
        ref:'User'
    },
    reviews: [ ///array of references to review objects
        {
            type:Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

///clusterMap looks for popup text inside of properties, so instead
///of restructuring schema, made a virtual.
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}</p>`;
})

///post mongoose middleware that activates AFTER findOneAndDelete middleware is
///executed, which is called when using findByIdAndDelete in app.js 
///post instead of pre so we can access the campground object that findOneAndDelete returns 
CampgroundSchema.post('findOneAndDelete', async function(deletedCamp){
    if(deletedCamp){ //if a camp has been deleted
        await Review.deleteMany({
            _id: {      
                $in: deletedCamp.reviews
            }//removes all reviews in Review collection that have a _id inside of the deletedCamp.reviews array 
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema); ///creates campgrounds collection in mongodb following schema 
///if required, model is exported 
