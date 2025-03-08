const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// In-memory data store for user profiles
let users = [];

// ----- User Profile Management Module -----

// Create Profile
app.post('/profile', (req, res) => {
  const { fullName, address, city, state, zipCode, skills, availability } = req.body;

  // Validate required fields
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

  // Create new user profile
  const newUser = { fullName, address, city, state, zipCode, skills, availability };
  users.push(newUser);
  res.status(201).json({ message: 'Profile created successfully', user: newUser });
});

// Get Profile
app.get('/profile', (req, res) => {
  if (users.length === 0) return res.status(404).json({ error: 'No profiles found' });
  res.json(users);
});

// Update Profile
app.put('/profile', (req, res) => {
  if (users.length === 0) return res.status(404).json({ error: 'No profiles found to update' });

  // Validate request body fields
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

  // Update user profile
  users[0] = { fullName, address, city, state, zipCode, skills, availability };
  res.json({ message: 'Profile updated successfully', user: users[0] });
});

// Delete Profile
app.delete('/profile', (req, res) => {
  if (users.length === 0) {
    return res.status(404).json({ error: 'No profile found to delete' });
  }
  users = [];
  res.json({ message: 'Profile deleted successfully' });
});

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
