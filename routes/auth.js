// authRoutes.js

const express = require('express');
const passport = require('../auth'); // Require the passport module

const router = express.Router();

// Authentication route for Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Authentication route for Django
router.get('/django',
  passport.authenticate('django')
);

// Callback endpoint for Google authentication
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    // Successful authentication, redirect to profile page or wherever needed
    res.redirect('/profile');
  }
);

// Callback endpoint for Django authentication
router.get('/django/callback',
  passport.authenticate('django', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/profile');
  }
);

module.exports = router;