const express = require('express');
const cors = require('cors'); // Added CORS for cross-origin requests
const app = express();
const path = require('path');

const port = process.env.NODE_ENV === 'test' ? 3001 : 3000; // Use different port for Jest

app.use(cors()); // Enable CORS to allow front-end requests
app.use(express.json());

// Serve static files (if needed for front-end)
app.use(express.static(path.join(__dirname, '..', 'client')));

// In-memory storage for profiles
let users = [];

// Default route for homepage
app.get('/', (req, res) => {
    res.send('User Profile Management API is Running!');
});

// Create Profile
app.post('/profile', (req, res) => {
    const { fullName, address, city, state, zipCode, skills, availability } = req.body;

    if (!fullName || !address || !city || !state || !zipCode || !skills || !availability) {
        return res.status(400).json({ error: 'Missing required profile fields' });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ error: 'Skills must be a non-empty array' });
    }
    if (!Array.isArray(availability) || availability.length === 0) {
        return res.status(400).json({ error: 'Availability must be a non-empty array' });
    }
    if (!/^[0-9]{5,9}$/.test(zipCode)) {
        return res.status(400).json({ error: 'Invalid zip code format' });
    }

    // Check if user already exists (by name)
    const existingUser = users.find(user => user.fullName === fullName);
    if (existingUser) {
        return res.status(409).json({ error: 'Profile already exists with this name' });
    }

    const newUser = { fullName, address, city, state, zipCode, skills, availability };
    users.push(newUser);
    res.status(201).json({ message: 'Profile created successfully', user: newUser });
});

// Get All Profiles
app.get('/profile', (req, res) => {
    if (users.length === 0) return res.status(404).json({ error: 'No profiles found' });
    res.json(users);
});

// Update Profile
app.put('/profile', (req, res) => {
    const { fullName, address, city, state, zipCode, skills, availability } = req.body;

    if (!fullName || !address || !city || !state || !zipCode || !skills || !availability) {
        return res.status(400).json({ error: 'Missing required profile fields' });
    }

    // Find user by name
    const userIndex = users.findIndex(user => user.fullName === fullName);
    if (userIndex === -1) return res.status(404).json({ error: 'Profile not found' });

    users[userIndex] = { fullName, address, city, state, zipCode, skills, availability };
    res.json({ message: 'Profile updated successfully', user: users[userIndex] });
});

// Delete Profile
app.delete('/profile', (req, res) => {
    const { fullName } = req.body;

    if (!fullName) {
        return res.status(400).json({ error: 'Full name is required to delete a profile' });
    }

    // Find user by name and remove them
    const userIndex = users.findIndex(user => user.fullName === fullName);
    if (userIndex === -1) return res.status(404).json({ error: 'Profile not found' });

    users.splice(userIndex, 1);
    res.json({ message: 'Profile deleted successfully' });
});

// Only start the server if Jest is not running
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
} else {
    server = null; // Prevent Jest from starting a second instance
}

module.exports = { app, server };
