const db = require('../config/db');
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: 'Password hashing error' });
        }

        // Create user
        const newUser = {
          name,
          email,
          password: hashedPassword,
          role: 'user',
          created_at: new Date()
        };

        db.query('INSERT INTO users SET ?', newUser, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Generate JWT
          const token = jwt.generateToken({
            id: result.insertId,
            email,
            role: 'user'
          });

          res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
              id: result.insertId,
              name,
              email,
              role: 'user'
            }
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const user = results[0];

      // Check password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Password comparison error' });
        }

        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Google Auth
exports.googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Google Auth Callback
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_FAILURE_REDIRECT}&error=auth_failed`);
    }
    if (!user) {
      return res.redirect(`${process.env.CLIENT_FAILURE_REDIRECT}&error=no_user`);
    }

    // Generate JWT
    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.redirect(`${process.env.CLIENT_SUCCESS_REDIRECT}?token=${token}`);
  })(req, res, next);
};

// Get current user
exports.getCurrentUser = (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};