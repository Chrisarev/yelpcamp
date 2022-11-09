if(process.env.NODE_ENV !== "production"){
    require('dotenv').config(); 
} ///environment variable that is either in dev or production mode


const express = require('express') 
const path = require('path') 
const mongoose = require('mongoose'); ///connection between JS and mongodb
const ejsMate = require('ejs-mate'); ///allows basic boilerplate
const session = require('express-session') ///allows us to make HTTP stateful with individual sessions and cookies
const flash = require('connect-flash') ///allows us to send flash messages in template renders
const ExpressError = require('./utils/ExpressError') ///our custom error handler
const methodOverride = require('method-override') ///allows http verbs other than POST/GET in forms 
const passport = require('passport'); ///authentication middleware 
const LocalStrategy = require('passport-local') ///LOCAL user/pass authentication strategy for passport
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize') ///for preventing mongo injection
const helmet = require('helmet') ///overall security package with content security policy

//requires router files
const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds.js')
const reviewsRoutes = require('./routes/reviews.js');
///const { dangerouslyDisableDefaultSrc } = require('helmet/dist/types/middlewares/content-security-policy');
const MongoDBStore = require('connect-mongo'); //allows us to store session in mongo
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//process.env.DB_URL; 

mongoose.connect(dbUrl, {
    useNewUrlParser:true,
    useUnifiedTopology:true
});///creates db yelp-camp(or connects to it if already made)

const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
    console.log("Database Connected")
});///checks to see if connected and handles db connection error

const app = express(); ///starts express app 

app.engine('ejs', ejsMate); ///allows basic boilerplate
app.set('view engine', 'ejs');  ///sets view engine to ejs 
app.set('views', path.join(__dirname, 'views')) ///so we can run app.js from outside of yelpcamp folder 

app.use(express.urlencoded({extended:true})) ///allows us to get req.params 
app.use(methodOverride('_method')) ///allows requests other than get/post through forms 
app.use(express.static(path.join(__dirname, 'public'))) ///allows us to serve static files such as css/js 
app.use(mongoSanitize()) ///prevents users from inputting characters that could result in mongo injection

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoDBStore.create({
    mongoUrl:dbUrl,
    secret, 
    touchAfter: 24 * 60 * 60 ///lazy update session unless 1 day has passed
});

store.on('error', function(e){
    console.log('SESSION STORE ERROR:', e)
})

const sessionConfig = {
    store,
    name:'__umli',
    secret, ///used to sign cookies
    resave:false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true, ///safety feature to safeguard against cross website scripting
        ///expires a week from now (1000ms(1sec) * 60secs(1min)* 60mins(1hour)* 24hrs(1day)* 7days(1week))
        /*secure:true,*/
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 ///maxAge of cookie is a week
    }
}

/* All of the allowed sources for fonts, images, srcs, etc for helmet*/
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "home.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

///sets up a session for current user and sends a connect.sid cookie to their browser to identify session 
app.use(session(sessionConfig)) 
///flash messages available when rendering
app.use(flash())
app.use(
    helmet({ 
        crossOriginEmbedderPolicy: false,
    }), ///check Helmet Docs for specification
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc:["'self'", ...connectSrcUrls],
            scriptSrc:["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            /*styleSrc:["'self'", "'unsafe-inline'",...styleSrcUrls],*/
            styleSrc:["*"],
            workerSrc: ["'self'", "blob:"], 
            objectSrc: [],
            imgSrc:[
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgz6d6j5h/",
                "https://images.unsplash.com/",
            ], ///cloudinary has to have user/company cloud name 
            fontSrc:["'self'", ...fontSrcUrls]
        }
    })
);

app.use(passport.initialize()) 
app.use(passport.session()) ///for persistent login sessions
passport.use(new LocalStrategy(User.authenticate()))
///telling passport to use UserSchema method authenticate which was added
///to user model with passport-local-mongoose
passport.serializeUser(User.serializeUser())
///tells passport how to store user in session
passport.deserializeUser(User.deserializeUser())
///tells passport how to remove user from session

app.use((req,res,next) =>{ ///allows flash messages to be accessible in all templates
    res.locals.currentUser = req.user; ///gives access to the current user in all templates
    /*res.locals.returnTo='/';
    if(req.originalUrl){res.locals.returnTo = req.originalUrl;} */
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

/*app.get('/fakeUser', async (req,res) =>{
    const user = new User({email:'chris@gmail.com',username:'Chrisss'})
    const newUser = await User.register(user, 'Kris')
    ///takes user model and hashes/stores password and checks for unique username
    res.send(newUser); 
}) */

app.use('/',userRoutes)

///prefixes all routes in campgroundsRoutes router file with /campgrounds, use router
app.use('/campgrounds', campgroundsRoutes)

///prefixes all routes in reviewRoutes router file with /campgrounds/:id/reviews, use router
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req,res) =>{
    res.render('home')
})

app.all('*', (req,res,next) => { ///runs for all unrecognized urls 
    next(new ExpressError('Page Not Found', 404))
    ///passes ExpressError into err param for app.use
})

///this runs if catchAsync catches error and calls next() OR if next(new ExpressError) gets called OR if validation error 
app.use((err,req,res,next) => { 
    const {status = 500} = err; ///gets status and message from ExpressError passed as err, else set defaults
    if(!err.message) err.message = 'Something went wrong!' ///if no error message, set default 
    res.status(status).render('error',{err})
    ///sets response status property to status passed in and renders error template 
})

app.listen(3000, () =>{
    console.log('Serving on Port 3000')
})
