const expappress = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory data store for user profiles
let users = [];

// ----- User Profile Management Module -----

// Create Profile (if user does not exist)
app.post('/profile', (req, res) => {
  const { email, fullName, address, city, state, zipCode, skills, availability } = req.body;

  // Validate required fields
  if (!email || !fullName || !address || !city || !state || !zipCode || !skills || !availability) {
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

  // Check if the user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User profile already exists' });
  }

  // Create new user profile
  const newUser = { email, fullName, address, city, state, zipCode, skills, availability };
  users.push(newUser);
  res.status(201).json({ message: 'Profile created successfully', user: newUser });
});

// Get Profile by Email
app.get('/profile/:email', (req, res) => {
  const { email } = req.params;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update Profile
app.put('/profile/:email', (req, res) => {
  const { email } = req.params;
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

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
  users[userIndex] = { email, fullName, address, city, state, zipCode, skills, availability };
  res.json({ message: 'Profile updated successfully', user: users[userIndex] });
});

// Delete Profile
app.delete('/profile/:email', (req, res) => {
  const { email } = req.params;
  const initialLength = users.length;
  users = users.filter(u => u.email !== email);
  if (users.length === initialLength) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ message: 'Profile deleted successfully' });
});

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
