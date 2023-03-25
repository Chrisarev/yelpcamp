const express = require('express'); 
const router = express.Router({mergeParams:true}); 
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user'); 
const passport = require('passport'); 
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    ///passport.authenticate 'local' specifies its authenticating local username/pass(not twit,fb, etc) , failureflash flashes msg, failureredirect
    ///redirects user to login page again if log in fails
    ///if user passes authenticating, code inside of route runs
    .post(passport.authenticate('local',{failureFlash:true, failureRedirect:'/login', keepSessionInfo:true}), users.login)

router.get('/logout', users.logout)
module.exports = router; 