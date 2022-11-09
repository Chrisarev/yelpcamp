const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')
///schemas made for different user input 

const extension = (joi) =>({
    type:'string', 
    base: joi.string(), 
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML or Scripts!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [], 
                    allowedAttributes:{},
                });
                if(clean!== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
}) ///Joi allows us to create extensions for joi types, 
///we are using sanitize-html npm package to sanitize input 

///new Joi instance with our extension applied 
const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({ ///campground should be an object AND it is required
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0), ///price is num, required, and non-negative
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(), 
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});
///used in validateCampground function, imported as campgroundSchema

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required() ///require the entire object or else empty form can be submitted
})