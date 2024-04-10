// auth.js

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Passport setup for Google authentication
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  console.log(profile);
  profile.email = profile.emails[0].value;
  profile.displayName = profile.displayName;
  return done(null, profile);
}));

// Passport setup for Django authentication
passport.use('django', new OAuth2Strategy({
  authorizationURL: 'https://theodi.org/auth/authorize/',
  tokenURL: 'https://theodi.org/auth/token/',
  clientID: process.env.DJANGO_CLIENT_ID,
  clientSecret: process.env.DJANGO_CLIENT_SECRET,
  callbackURL: process.env.DJANGO_CALLBACK_URL,
  grant_type: 'authorization_code', // Specify grant type
  pkce: true, // Enable PKCE,
  state: true
}, (accessToken, refreshToken, profile, done) => {
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

module.exports = passport;