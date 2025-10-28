const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parking.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route for nearby parking
router.get('/nearby', authMiddleware, parkingController.getNearbyParking);

// Admin routes
router.get('/', authMiddleware, parkingController.getAllParking);
router.get('/:id', authMiddleware, parkingController.getParkingById);
router.post('/', authMiddleware, parkingController.addParking);
router.put('/:id', authMiddleware, parkingController.updateParking);
router.delete('/:id', authMiddleware, parkingController.deleteParking);

// Admin user management routes
router.get('/users', authMiddleware, parkingController.getAllUsers);
router.put('/users/:id', authMiddleware, parkingController.updateUserRole);
router.delete('/users/:id', authMiddleware, parkingController.deleteUser);

module.exports = router;