const express = require('express');
const router = express.Router();
const userController = require('../controller/usercontroller.js');

// User Signup
router.post('/signup', userController.signup);

// User Login
router.post('/login', userController.login);

// Update User Level
router.patch('/level', userController.updateLevel);

// Add Coins to User
router.patch('/coins/add', userController.addCoins);

// Remove Coins from User
router.patch('/coins/remove', userController.removeCoins);

// Forgot password route
router.post('/forgot-password', userController.forgotPassword);

// Reset password route
router.post('/reset-password', userController.resetPassword);

module.exports = router;