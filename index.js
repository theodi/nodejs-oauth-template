//Loads the config fomr config.env to process.env (turn off prior to deployment)
require("dotenv").config({ path: "./config.env" });
// index.js

/*  EXPRESS */

const express = require('express');
const app = express();
const session = require('express-session');
var sitedata = {};
sitedata.user = null;
sitedata.page = {};
sitedata.page.title = "ODI Template (NodeJS + Express + OAuth)";
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

/* Setup public directory
 * Everything in her does not require authentication */

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  if (userProfile) {
    res.redirect("/profile");
  } else {
    sitedata.page.title = "ODI Template (NodeJS + Express + OAuth)";
    res.render('pages/auth', {
      data: sitedata
    });
  }
});

/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    sitedata.user = null;
    userProfile = null;
    user = null;
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
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
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
  sitedata.user = null;
  sitedata.page.title = "401 Unauthorised";
  return res.status(401).render("errors/401", {
    data: sitedata
  });
}

/* Setup private directory, everything in here requires authentication */

app.use('/private', ensureAuthenticated);
app.use('/private', express.static(__dirname + '/private'));

/* Define all the pages */

/* Do not require login */

app.get('/page1', function(req, res) {
  sitedata.user = userProfile;
  sitedata.page.title = "Page 1";
  res.render('pages/page1', {
    data: sitedata
  })
});

/* Require user to be logged in */

app.get('/profile', function(req, res) {
  if (!userProfile) {
    sitedata.user = null;
    sitedata.page.title = "401 Unauthorised";
    return res.status(401).render("errors/401", {
      data: sitedata
    });
  }
  sitedata.user = userProfile;
  sitedata.page.title = "Profile page";
  res.render('pages/profile', {
    data: sitedata
  })
});

app.get('/page2', function(req, res) {
  if (!userProfile) {
    sitedata.user = null;
    sitedata.page.title = "401 Unauthorised";
    return res.status(401).render("errors/401", {
      data: sitedata
    });
  }
  sitedata.user = userProfile;
  sitedata.page.title = "Page 2";
  res.render('pages/page2', {
    data: sitedata
  })
});

//Keep this at the END!

app.get('*', function(req, res){
  sitedata.page.title = "404 Not Found";
  return res.status(404).render("errors/404", {
    data: sitedata
  });
});

/* Run server */

const port = process.env.PORT || 3080;
app.listen(port , () => console.log('App listening on port ' + port));
