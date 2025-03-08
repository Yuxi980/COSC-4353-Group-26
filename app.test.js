// app.test.js
const http = require('http');

// Create a simple in-memory mock for localStorage in Node
global.localStorage = {
  _data: {},
  setItem(key, value) {
    this._data[key] = value;
  },
  getItem(key) {
    return this._data[key] || null;
  },
  removeItem(key) {
    delete this._data[key];
  },
  clear() {
    this._data = {};
  }
};

jest.setTimeout(15000); 

// Import the Express app
const app = require('./app');
// Export the in-memory volunteerHistory for direct manipulation
const { volunteerHistory } = require('./app');

// Wrap the Express app in an HTTP server for Supertest
const server = http.createServer(app);
const request = require('supertest');

// Reset the in-memory arrays via a test-only endpoint
beforeEach(async () => {
  await request(server).post('/test/reset');
});

describe('Volunteer System API', () => {
  // Registration Endpoint Tests
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(server)
        .post('/register')
        .send({
          email: 'testuser@example.com',
          password: '123456',
          role: 'volunteer'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toEqual('Registration successful');
    });

    it('should not register a duplicate user', async () => {
      // Register once
      await request(server)
        .post('/register')
        .send({
          email: 'duplicate@example.com',
          password: '123456',
          role: 'volunteer'
        });
      // Attempt duplicate registration
      const res = await request(server)
        .post('/register')
        .send({
          email: 'duplicate@example.com',
          password: '123456',
          role: 'volunteer'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('User already exists');
    });
  });

  // Login Endpoint Tests
  describe('POST /login', () => {
    it('should login successfully with correct credentials', async () => {
      // First, register a user
      await request(server)
        .post('/register')
        .send({
          email: 'loginuser@example.com',
          password: '123456',
          role: 'volunteer'
        });
      // Then, log in
      const res = await request(server)
        .post('/login')
        .send({
          email: 'loginuser@example.com',
          password: '123456'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Welcome');
    });

    it('should fail login with incorrect password', async () => {
      await request(server)
        .post('/register')
        .send({
          email: 'wrongpass@example.com',
          password: '123456',
          role: 'volunteer'
        });
      const res = await request(server)
        .post('/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toEqual('Authentication failed');
    });
  });

  // Profile Management Tests
  describe('Profile Management', () => {
    it('should get profile for a registered user', async () => {
      await request(server)
        .post('/register')
        .send({
          email: 'profileuser@example.com',
          password: '123456',
          role: 'volunteer'
        });
      const res = await request(server).get('/profile/profileuser@example.com');
      expect(res.statusCode).toEqual(200);
      expect(res.body.user.email).toEqual('profileuser@example.com');
    });

    it('should update profile for a registered user', async () => {
      await request(server)
        .post('/register')
        .send({
          email: 'updateuser@example.com',
          password: '123456',
          role: 'volunteer'
        });
      const res = await request(server)
        .put('/profile/updateuser@example.com')
        .send({
          fullName: 'Test User',
          address: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          skills: ['First Aid'],
          availability: ['2025-03-15']
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.user.fullName).toEqual('Test User');
    });
  });

  // Event Management Tests
  describe('Event Management', () => {
    it('should create an event successfully', async () => {
      const res = await request(server)
        .post('/events')
        .send({
          eventName: 'Food Drive',
          eventDescription: 'Collect food for shelter',
          eventLocation: 'Community Center',
          requiredSkills: ['Organizing'],
          urgency: 'High',
          eventDate: '2025-05-01'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.event.eventName).toEqual('Food Drive');
    });

    it('should update an event successfully', async () => {
      const createRes = await request(server)
        .post('/events')
        .send({
          eventName: 'Clean Up',
          eventDescription: 'Park clean-up event',
          eventLocation: 'Central Park',
          requiredSkills: ['Cleaning'],
          urgency: 'Medium',
          eventDate: '2025-06-01'
        });
      const eventId = createRes.body.event.id;
      const updateRes = await request(server)
        .put(`/events/${eventId}`)
        .send({
          urgency: 'High'
        });
      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.event.urgency).toEqual('High');
    });
  });

  // Volunteer Matching Tests
  describe('Volunteer Matching', () => {
    it('should match events based on volunteer skills', async () => {
      // Register volunteer and update profile
      await request(server)
        .post('/register')
        .send({
          email: 'matchuser@example.com',
          password: '123456',
          role: 'volunteer'
        });
      await request(server)
        .put('/profile/matchuser@example.com')
        .send({
          fullName: 'Match User',
          address: '123 Match St',
          city: 'Match City',
          state: 'MC',
          zipCode: '54321',
          skills: ['Teaching'],
          availability: ['2025-07-01']
        });
      // Create an event that requires 'Teaching'
      await request(server)
        .post('/events')
        .send({
          eventName: 'Teaching Workshop',
          eventDescription: 'Teach kids',
          eventLocation: 'Library',
          requiredSkills: ['Teaching'],
          urgency: 'Low',
          eventDate: '2025-07-15'
        });
      const res = await request(server)
        .get('/volunteer-matches/matchuser@example.com');
      expect(res.statusCode).toEqual(200);
      expect(res.body.matchedEvents.length).toBeGreaterThan(0);
    });
  });

  // Notification Module Tests
  describe('Notification Module', () => {
    it('should send a notification', async () => {
      const res = await request(server)
        .post('/notify')
        .send({
          email: 'notifyuser@example.com',
          message: 'Test notification'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Notification sent');
    });
  });

  // Volunteer History Tests
  describe('Volunteer History', () => {
    it('should return volunteer history for a user', async () => {
      // Directly add an entry to the in-memory volunteerHistory array
      volunteerHistory.push({
        volunteerEmail: 'historyuser@example.com',
        eventName: 'Community Garden',
        date: '2025-08-01',
        status: 'Completed'
      });
      const res = await request(server)
        .get('/volunteer-history/historyuser@example.com');
      expect(res.statusCode).toEqual(200);
      expect(res.body.history[0].eventName).toEqual('Community Garden');
    });
  });
});

// Close the server after all tests complete
afterAll(() => {
  server.close();
});