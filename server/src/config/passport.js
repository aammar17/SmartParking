const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return done(err, null);
    }
    done(null, results[0]);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    db.query('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, results) => {
      if (err) return done(err, null);
      
      if (results.length > 0) {
        // User exists, return existing user
        return done(null, results[0]);
      } else {
        // Create new user
        const newUser = {
          google_id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'user', // Default role
          created_at: new Date()
        };
        
        db.query('INSERT INTO users SET ?', newUser, (err, result) => {
          if (err) return done(err, null);
          
          // Get the created user
          db.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err, results) => {
            if (err) return done(err, null);
            return done(null, results[0]);
          });
        });
      }
    });
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;