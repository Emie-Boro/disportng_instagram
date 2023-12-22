 const LocalStrategy = require('passport-local').Strategy
 const passport = require('passport')
 const User = require('./User')

 // Initializing Passport JS
 const bcrypt = require('bcryptjs');
 
passport.use( new LocalStrategy((username, password, done) => {
    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: 'Invalid User' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return done(err);
          }

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect Password' });
          }
        });
      })
      .catch((err) => {
        console.log(err);
        return done(err);
      });
  })
);

   // Serialize user information into the session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Deserialize user information from the session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .exec()
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
    .catch((err) => {
      return done(err);
    });
});

module.exports = passport;
 