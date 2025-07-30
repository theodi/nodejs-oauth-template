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

// Serialize and deserialize user
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

module.exports = passport;