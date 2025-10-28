const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const parkingRoutes = require('./parking.routes');

router.use('/auth', authRoutes);
router.use('/parking', parkingRoutes);

module.exports = router;