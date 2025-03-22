const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
const port = process.env.NODE_ENV === 'test' ? 3001 : 3000;

app.use(cors());
app.use(express.json());

// ✅ Serve static files like CSS/JS/images from the client folder
app.use(express.static(path.join(__dirname, '..', 'client')));

// ✅ Serve the HTML file at the root
app.get('/', (req, res) => {
  console.log("GET / route hit");
  res.sendFile(path.join(__dirname, '..', 'client', 'UserProfileManagement.html'));
});

// ✅ Example working endpoint
app.get('/ping', (req, res) => {
  res.send('pong');
});


// Create profile
app.post('/profile', (req, res) => {
  const { fullName, address, city, state, zipCode, skills, availability, preferences } = req.body;


  if (!fullName || !address || !city || !state || !zipCode || !skills || !availability) {
    return res.status(400).json({ error: 'Missing required fields' });
  }


  const skillsStr = skills.join(',');
  const availabilityStr = availability.join(',');


  const sql = `INSERT INTO UserProfile (fullName, address, city, state, zipCode, skills, preferences, availability)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [fullName, address, city, state, zipCode, skillsStr, preferences, availabilityStr];


  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Database insert failed' });
    res.status(201).json({ message: 'Profile created successfully', id: result.insertId });
  });
});


// Get all profiles
app.get('/profile', (req, res) => {
  db.query('SELECT * FROM UserProfile', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve profiles' });
    res.json(results);
  });
});


let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
}

module.exports = { app, server };