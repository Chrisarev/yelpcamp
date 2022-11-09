const User = require('../models/user'); 

module.exports.renderRegister = (req,res) =>{
    res.render('users/register')
}

module.exports.register = async(req,res,next) =>{
    try{
        const {email, username, password} = req.body; 
        const user = new User({email,username}) ///needed because User.register takes instance of user and password
        const registeredUser = await User.register(user,password) 
        ///User.register hashes password and stores it as well as checks for unique username (methods given by passportlocalmongoose)
        req.login(registeredUser, err => { ///req.login is passport method that uses passport.authenticate middleware to login user
            if(err) return next(err); 
            req.flash('success','Welcome to YelpCamp!')
            res.redirect('/campgrounds')
        })///logs in user when they register
    }catch(e){
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderLogin = (req,res) =>{
    res.render('users/login')
}

module.exports.login = (req,res) =>{
    req.flash('success', 'Welcome back!')
    ///sets redirectUrl to url stored in session when running isLoggedIn middleware
    ///or /campgrounds if nothing is stored
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo; ///so that we aren't redirected to same URL on different request
    res.redirect(redirectUrl)
    /*if(returnTo==='/'){
       return res.redirect('/campgrounds')
    }
    res.redirect(returnTo) ///returnTo is set in app.js as req.static so it is accessible here
    */
}

module.exports.logout = (req,res) =>{
    ///logs user out (method given by passport)
    req.logout(function(err) {
        if(err){return next(err)} ///if error return next
        req.flash('success', "Succesfully logged out")
        res.redirect('/campgrounds')
    })
}