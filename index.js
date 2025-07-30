// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config({ path: "./config.env" });

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// index.js

import express from 'express';
import session from 'express-session';
import passport from './passport.js'; // Import the auth module
import authRoutes from './routes/auth.js'; // Import the authentication routes module

const app = express();
const port = process.env.PORT || 3080;
app.set('view engine', 'ejs');

// Middleware for logging
import logger from 'morgan';
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

import { ensureAuthenticated } from './middleware/auth.js';

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