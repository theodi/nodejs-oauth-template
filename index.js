//Loads the config fomr config.env to process.env (turn off prior to deployment)
require("dotenv").config({ path: "./config.env" });
// index.js

/*  EXPRESS */

const express = require('express');
const app = express();
const session = require('express-session');
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

//Put the user object in a global veriable so it can be accessed from templates
app.use(function(req, res, next) {
  try {
    res.locals.user = req.session.passport.user;
    next();
  } catch (error) {
    res.locals.user = req.session.user;
    next();
  }
});

/* Setup public directory
 * Everything in her does not require authentication */

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  if (req.session.passport) {
    res.redirect("/profile");
  } else { 
    res.locals.pageTitle ="ODI Template (NodeJS + Express + OAuth)";
    res.render('pages/auth');
  }
});

/*  PASSPORT SETUP  */

const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    //console.log(req.user);
    // Successful authentication, redirect success.
    // Redirects to the profile page, CHANGE THIS to redirect to another page, e.g. a tool that is protected
    res.redirect('/profile');
  });


/* Setup function to handle authentications */

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    unauthorised(res);
}

function unauthorised(res) {
  res.locals.pageTitle ="401 Unauthorised";
  return res.status(401).render("errors/401");
}

/* Setup private directory, everything in here requires authentication */

app.use('/private', ensureAuthenticated);
app.use('/private', express.static(__dirname + '/private'));

/* Define all the pages */

/* Do not require login */

app.get('/page1', function(req, res) {
  res.locals.pageTitle ="Page 1";
  res.render('pages/page1')
});

/* Require user to be logged in */

app.get('/profile', function(req, res) {
  if (!req.isAuthenticated()) {
    res.locals.pageTitle ="401 Unauthorised";
    return res.status(401).render("errors/401");
  }
  res.locals.pageTitle ="Profile page";
    
  res.render('pages/profile')
});

app.get('/page2', function(req, res) {
  if (!req.isAuthenticated()) {
    res.locals.pageTitle ="401 Unauthorised";
    return res.status(401).render("errors/401");
  }
  res.locals.pageTitle ="Page 2";
  res.render('pages/page2');
});

//Keep this at the END!

app.get('*', function(req, res){
  res.locals.pageTitle ="404 Not Found";
  return res.status(404).render("errors/404");
});

/* Run server */

const port = process.env.PORT || 3080;
app.listen(port , () => console.log('App listening on port ' + port));