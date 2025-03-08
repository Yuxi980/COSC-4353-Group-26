const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Serve LoginAndRegister.html when visiting /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'LoginAndRegister.html'));
});

// In-memory data stores
let users = [];             // Stores user information
let events = [];            // Stores event data
let volunteerHistory = [];  // Stores volunteer participation history

// ----- Login Module -----
// Registration Endpoint
app.post('/register', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || password.length < 6 || !role) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  // Note: In production, passwords must be hashed.
  users.push({ email, password, role });
  res.status(201).json({ message: 'Registration successful' });
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  res.json({ message: `Welcome ${user.email}!`, user });
});

// ----- User Profile Management Module -----
// Get Profile
app.get('/profile/:email', (req, res) => {
  const { email } = req.params;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Update Profile
app.put('/profile/:email', (req, res) => {
  const { email } = req.params;
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  
  // Example fields: fullName, address, city, state, zipCode, skills, availability
  const { fullName, address, city, state, zipCode, skills, availability } = req.body;
  // Validate required fields
  if (!fullName || !address || !city || !state || !zipCode) {
    return res.status(400).json({ error: 'Missing required profile fields' });
  }
  
  users[userIndex] = { ...users[userIndex], fullName, address, city, state, zipCode, skills, availability };
  res.json({ message: 'Profile updated', user: users[userIndex] });
});

// ----- Event Management Module -----
// Create Event
app.post('/events', (req, res) => {
  const { eventName, eventDescription, eventLocation, requiredSkills, urgency, eventDate } = req.body;
  if (!eventName || !eventDescription || !eventLocation || !requiredSkills || !urgency || !eventDate) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }
  const newEvent = { id: events.length + 1, eventName, eventDescription, eventLocation, requiredSkills, urgency, eventDate };
  events.push(newEvent);
  res.status(201).json({ message: 'Event created successfully', event: newEvent });
});

// Modify Event
app.put('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return res.status(404).json({ error: 'Event not found' });
  
  events[eventIndex] = { ...events[eventIndex], ...req.body };
  res.json({ message: 'Event updated successfully', event: events[eventIndex] });
});

// ----- Volunteer Matching Module -----
// Match Volunteer to Events
app.get('/volunteer-matches/:email', (req, res) => {
  const { email } = req.params;
  const volunteer = users.find(u => u.email === email);
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
  
  // Assume volunteer.skills is an array of skill names
  const matchedEvents = events.filter(event => 
    event.requiredSkills.some(skill => volunteer.skills && volunteer.skills.includes(skill))
  );
  res.json({ volunteer, matchedEvents });
});

// ----- Notification Module -----
// Simulated Notification Endpoint
app.post('/notify', (req, res) => {
  const { email, message } = req.body;
  console.log(`Notification for ${email}: ${message}`);
  res.json({ message: 'Notification sent' });
});

// ----- Volunteer History Module -----
// Get Volunteer History
app.get('/volunteer-history/:email', (req, res) => {
  const { email } = req.params;
  const history = volunteerHistory.filter(h => h.volunteerEmail === email);
  res.json({ volunteerEmail: email, history });
});

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
module.exports.volunteerHistory = volunteerHistory;