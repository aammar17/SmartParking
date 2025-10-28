require('dotenv').config(); // Add this line at the top

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./src/config/db');
const routes = require('./src/routes');
const passport = require('passport');
const session = require('express-session');
const passportConfig = require('./src/config/passport');

const app = express();

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

// Check and create admin user on startup
const createAdminUser = () => {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123'; // Change this in production
  
  const bcrypt = require('bcryptjs');
  
  // Check if admin exists
  db.query('SELECT * FROM users WHERE email = ? AND role = ?', [adminEmail, 'admin'], (err, results) => {
    if (err) {
      console.error('Error checking admin user:', err);
      return;
    }
    
    if (results.length > 0) {
      console.log('Admin user already exists');
    } else {
      // Hash password
      bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        const newAdmin = {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          created_at: new Date()
        };
        
        db.query('INSERT INTO users SET ?', newAdmin, (err, result) => {
          if (err) {
            console.error('Error creating admin user:', err);
            return;
          }
          console.log('Admin user created successfully');
          console.log('Email:', adminEmail);
          console.log('Password:', adminPassword);
        });
      });
    }
  });
};

// Check and create super admin user on startup
const createSuperAdminUser = () => {
  const superAdminEmail = 'superadmin@example.com';
  const superAdminPassword = 'superadmin123'; // Change this in production
  
  const bcrypt = require('bcryptjs');
  
  // Check if super admin exists
  db.query('SELECT * FROM users WHERE email = ? AND role = ?', [superAdminEmail, 'superadmin'], (err, results) => {
    if (err) {
      console.error('Error checking super admin user:', err);
      return;
    }
    
    if (results.length > 0) {
      console.log('Super Admin user already exists');
    } else {
      // Hash password
      bcrypt.hash(superAdminPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        const newSuperAdmin = {
          name: 'Super Admin User',
          email: superAdminEmail,
          password: hashedPassword,
          role: 'superadmin',
          created_at: new Date()
        };
        
        db.query('INSERT INTO users SET ?', newSuperAdmin, (err, result) => {
          if (err) {
            console.error('Error creating super admin user:', err);
            return;
          }
          console.log('Super Admin user created successfully');
          console.log('Email:', superAdminEmail);
          console.log('Password:', superAdminPassword);
        });
      });
    }
  });
};

// Start server after checking admin users
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create admin users if they don't exist
  createAdminUser();
  createSuperAdminUser();
});