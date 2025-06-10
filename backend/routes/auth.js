const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// No JWT middleware here
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;