require("dotenv").config({ path: "../config/.env" });


const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const usersBL = require("../models/usersBL");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  usersBL.getUserById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      // options for google strategy
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // passport callback function
      // check if user already exists in our own db
      usersBL
        .getUserByEmail(profile.emails[0].value)
        .then((currentUser, err) => {
          if (err) {
            done(err);
          }
          if (currentUser) {
            done(null, currentUser);
          } else {
            done(null, false);
          }
        });
    }
  )
);

module.exports = passport
