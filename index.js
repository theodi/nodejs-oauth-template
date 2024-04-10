// Load environment variables securely
require("dotenv").config({ path: "./config.env" });

// index.js

const express = require('express');
const session = require('express-session');
const passport = require('./passport'); // Require the auth module
const authRoutes = require('./routes/auth'); // Require the authentication routes module
const app = express();
const port = process.env.PORT || 3080;
app.set('view engine', 'ejs');

// Middleware for logging
const logger = require('morgan');
app.use(logger('dev'));

// Middleware for parsing incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Other middleware and setup code...

// Session configuration
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
}));

// Middleware for user object

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.user = req.session.passport ? req.session.passport.user : req.session.user;
  next();
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

// Use authentication routes
app.use('/auth', authRoutes);

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