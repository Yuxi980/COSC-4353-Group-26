const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// In-memory data stores
let events = [];            // Stores event data
let volunteerHistory = [];  // Stores volunteer participation history

// ----- Create Event Module -----

app.post('/event', (req,res) =>{
    const {eventName, description, location, skills, urgency, date } = req.body;

    if(!eventName || !description || !location || !skills || !urgency || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills must be a non-empty array' });
    }

    const newEvent = { eventName, description, location, skills, urgency, date};
    events.push(newEvent);
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
})

app.get('/event', (req, res) => {
    if (events.length === 0) return res.status(404).json({ error: 'No events found' });
    res.json(events);
  });

  app.put('/event', (req, res) => {
    if (events.length === 0) return res.status(404).json({ error: 'No event found to update' });
  
    // Validate request body fields
    const {eventName, description, location, skills, urgency, date } = req.body;

    if(!eventName || !description || !location || !skills || !urgency || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills must be a non-empty array' });
    }

    events[0] = {eventName, description, location, skills, urgency, date };
    res.json({ message: 'Event updated successfully', event: events[0] });

  });


// Delete Event
app.delete('/event', (req, res) => {
    if (eventss.length === 0) {
      return res.status(404).json({ error: 'No event found to delete' });
    }
    events = [];
    res.json({ message: 'Event deleted successfully' });
  });
  
  // Start server if not in test mode
  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
  
  module.exports = app;