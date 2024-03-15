// Load environment variables securely
require("dotenv").config({ path: "./config.env" });

// index.js

/* EXPRESS */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const app = express();
const port = process.env.PORT || 3080;

app.set('view engine', 'ejs');

// Middleware for logging
const logger = require('morgan');
app.use(logger('dev'));

// Middleware for parsing incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  //cookie: { secure: true } // Set to true in production if served over HTTPS
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware for user object
app.use(function(req, res, next) {
  res.locals.user = req.session.passport ? req.session.passport.user : req.session.user;
  next();
});

/* Google AUTH */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Authentication routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/profile');
  });

// Logout route
app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  console.log('checking authentication');
  if (req.isAuthenticated())
    return next();
  else
    unauthorised(res);
}

function unauthorised(res) {
  res.locals.pageTitle ="401 Unauthorised";
  return res.status(401).render("errors/401");
}

// Routes
app.use(express.static(__dirname + '/public')); // Public directory
app.get('/', function(req, res) {
  if (req.session.passport) {
    res.redirect("/profile");
  } else {
    res.locals.pageTitle ="ODI Template (NodeJS + Express + OAuth)";
    res.render('pages/auth');
  }
});

app.get('/page1', function(req, res) {
  res.locals.pageTitle ="Page 1";
  res.render('pages/page1');
});

app.get('/profile', ensureAuthenticated, function(req, res) {
  res.locals.pageTitle ="Profile page";
  res.render('pages/profile');
});

app.get('/page2', ensureAuthenticated, function(req, res) {
  res.locals.pageTitle ="Page 2";
  res.render('pages/page2');
});

// Error handling
app.get('/error', (req, res) => res.send("error logging in"));
app.get('*', function(req, res){
  res.locals.pageTitle ="404 Not Found";
  return res.status(404).render("errors/404");
});

// Start server
app.listen(port , () => console.log('App listening on port ' + port));