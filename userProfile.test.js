const request = require('supertest');
const { app, server } = require('../userProfile');
const mysql = require('mysql2');
require('dotenv').config();

// Use env vars for DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_profile_db'
});

// Clean database before each test
beforeEach(done => {
  db.query('DELETE FROM UserProfile', done);
});

describe('User Profile API (MySQL)', () => {

  it('should create a new profile', async () => {
    const res = await request(app).post('/profile').send({
      fullName: 'Test User',
      address: '123 Main St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      skills: ['Teaching', 'Cooking'],
      availability: ['04/10/2025', '04/12/2025'],
      preferences: 'Weekends only'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Profile created successfully');
  });

  it('should retrieve all profiles', async () => {
    await request(app).post('/profile').send({
      fullName: 'Another User',
      address: '456 Sample Rd',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75001',
      skills: ['Event Management'],
      availability: ['05/01/2025'],
      preferences: ''
    });

    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].fullName).toBe('Another User');
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app).post('/profile').send({
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      skills: [],
      availability: [],
      preferences: ''
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing required fields');
  });

  it('should return an empty array if no profiles exist', async () => {
    const res = await request(app).get('/profile');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

afterAll(() => {
  db.end();
  server && server.close();
});









