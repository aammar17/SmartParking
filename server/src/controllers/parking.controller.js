const db = require('../config/db');

// Get nearby parking slots
exports.getNearbyParking = (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Convert to numbers
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseFloat(radius);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      return res.status(400).json({ error: 'Invalid latitude, longitude, or radius' });
    }

    const query = `
      SELECT 
        id,
        name,
        address,
        lat,
        lng,
        price_per_hour,
        status,
        type,
        capacity,
        occupied_slots,
        (6371 * acos(
          cos(radians(?)) * 
          cos(radians(lat)) * 
          cos(radians(lng) - radians(?)) + 
          sin(radians(?)) * 
          sin(radians(lat))
        )) AS distance
      FROM parking_slots 
      WHERE 
        (6371 * acos(
          cos(radians(?)) * 
          cos(radians(lat)) * 
          cos(radians(lng) - radians(?)) + 
          sin(radians(?)) * 
          sin(radians(lat))
        )) <= ?
      ORDER BY distance
      LIMIT 50
    `;

    // Parameters for the query (each ? placeholder needs a value)
    const params = [
      latNum, lngNum, latNum, // First set of cos/sin calculations
      latNum, lngNum, latNum, // Second set of cos/sin calculations
      radiusNum // Radius for distance check
    ];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all parking slots (admin only)
exports.getAllParking = (req, res) => {
  db.query('SELECT * FROM parking_slots ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get parking slot by ID
exports.getParkingById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM parking_slots WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Parking slot not found' });
    }
    res.json(results[0]);
  });
};

// Add new parking slot (admin only)
exports.addParking = (req, res) => {
  const { name, address, lat, lng, price_per_hour, status, type, capacity } = req.body;

  const newParking = {
    name,
    address,
    lat,
    lng,
    price_per_hour,
    status,
    type,
    capacity,
    occupied_slots: 0,
    created_at: new Date()
  };

  db.query('INSERT INTO parking_slots SET ?', newParking, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      message: 'Parking slot added successfully',
      id: result.insertId,
      ...newParking
    });
  });
};

// Update parking slot (admin only)
exports.updateParking = (req, res) => {
  const { id } = req.params;
  const { name, address, lat, lng, price_per_hour, status, type, capacity } = req.body;

  const updatedParking = {
    name,
    address,
    lat,
    lng,
    price_per_hour,
    status,
    type,
    capacity,
    updated_at: new Date()
  };

  db.query('UPDATE parking_slots SET ? WHERE id = ?', [updatedParking, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Parking slot not found' });
    }
    res.json({ message: 'Parking slot updated successfully' });
  });
};

// Delete parking slot (admin only)
exports.deleteParking = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM parking_slots WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Parking slot not found' });
    }
    res.json({ message: 'Parking slot deleted successfully' });
  });
};

// Get all users (admin only)
exports.getAllUsers = (req, res) => {
  db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Update user role (admin only)
exports.updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  db.query('UPDATE users SET role = ? WHERE id = ?', [role, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User role updated successfully' });
  });
};

// Delete user (admin only)
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
};