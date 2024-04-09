// Load environment variables securely
require("dotenv").config({ path: "./config.env" });

// index.js

/* EXPRESS */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy; // Assuming OAuth2Strategy is compatible with your custom Django OAuth endpoint
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
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Middleware for user object
app.use(function(req, res, next) {
  res.locals.user = req.session.passport ? req.session.passport.user : req.session.user;
  next();
});

// Passport setup for Google authentication
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  console.log(profile);
  profile.email = profile.emails[0].value;
  profile.displayName = profile.displayName;
  // Google authentication strategy callback function
  // You can customize this function to handle user creation/updating etc.
  return done(null, profile);
}));


/* Custom Django AUTH */
passport.use('django', new OAuth2Strategy({
  authorizationURL: 'https://theodi.org/auth/authorize/',
  tokenURL: 'https://theodi.org/auth/token/',
  clientID: process.env.DJANGO_CLIENT_ID,
  clientSecret: process.env.DJANGO_CLIENT_SECRET,
  callbackURL: process.env.DJANGO_CALLBACK_URL,
  grant_type: 'authorization_code', // Specify grant type
  pkce: true, // Enable PKCE,
  state: true
},
function(accessToken, refreshToken, profile, done) {
  fetch('https://theodi.org/api/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  })
  .then(userProfile => {
    // Merge the fetched user profile with the profile object
    Object.keys(userProfile).forEach(key => {
      profile[key] = userProfile[key];
    });
    return done(null, profile);
  })
  .catch(error => {
    console.error('Error fetching user profile:', error);
    return done(error);
  });
}));

// Serialize and deserialize user
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Authentication route for Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Authentication route for Django
app.get('/auth/django',
  passport.authenticate('django')
);

// Callback endpoint for Google authentication
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    // Successful authentication, redirect to profile page or wherever needed
    res.redirect('/profile');
  }
);

app.get('/auth/django/callback',
  passport.authenticate('django', { failureRedirect: '/error' }),
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