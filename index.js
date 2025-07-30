const fs = require('fs');
const path = require('path');

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

const { ensureAuthenticated } = require('./middleware/auth');

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.user = req.session.passport ? req.session.passport.user : req.session.user;
  next();
});

app.use((req, res, next) => {
  // Read package.json file
  fs.readFile(path.join(__dirname, 'package.json'), 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading package.json:', err);
          return next();
      }

      try {
          const packageJson = JSON.parse(data);
          // Extract version from package.json
          var software = {};
          software.version = packageJson.version;
          software.homepage = packageJson.homepage;
          software.versionLink = packageJson.homepage + "/releases/tag/v" + packageJson.version;
          res.locals.software = software;
      } catch (error) {
          console.error('Error parsing package.json:', error);
      }
      next();
  });
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
  res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
  res.setHeader('Expires', '0'); // Proxies.
  next();
});

/* Setup public directory
 * Everything in her does not require authentication */

app.use(express.static(__dirname + '/public'));

// Use authentication routes
app.use('/auth', authRoutes);

app.get('/', function(req, res) {
  const page = {
    title: "ODI Template",
    link: "/"
  };
  res.locals.page = page;
  res.render('pages/home');
});

/* Setup private directory, everything in here requires authentication */

app.use('/private', ensureAuthenticated);
app.use('/private', express.static(__dirname + '/private'));

/* Example of a private route */

app.get('/private', ensureAuthenticated, function(req, res) {
  const page = {
    title: "Private",
    link: "/private"
  };
  res.locals.page = page;
  res.render('pages/private');
});

// Start server
app.listen(port , () => console.log('App listening on port ' + port));