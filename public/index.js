const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create User model
const User = mongoose.model('user', userSchema);

// Handle signup request
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check for missing fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Create new user document
        const newUser = new User({ username, email, password });
        
        // Save user in MongoDB
        await newUser.save();
        res.status(200).json({ message: 'User signed up successfully!' });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error for email
            res.status(400).json({ message: 'Email is already registered.' });
        } else {
            res.status(500).json({ message: 'Error signing up: ' + err.message });
        }
    }
});

module.exports = router;
