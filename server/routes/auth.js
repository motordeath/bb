const express = require('express');
const router = express.Router();
const User = require('../models/User');
router.post('/signup', async (req, res) => {
  try {
    const { studentId, fullName, email, collegeName, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or student ID already exists'
      });
    }

    // Create new user
    const user = new User({
      studentId,
      fullName,
      email,
      collegeName,
      password
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        collegeName: user.collegeName
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Find user by student ID
    const user = await User.findOne({ studentId });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid student ID or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid student ID or password'
      });
    }

    // Return user data
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        studentId: user.studentId,
        fullName: user.fullName,
        email: user.email,
        collegeName: user.collegeName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

module.exports = router;