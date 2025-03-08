// Backend.test.js
const request = require('supertest');
const app = require('./LARBackend'); 

describe('User API Tests', () => {
  test('User registration success', async () => {
    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'test123',
      userType: 'volunteer'
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Registered successfully');
  });

  test('Prevent duplicate registration', async () => {
    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'test123',
      userType: 'volunteer'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('User already exists');
  });

  test('User login success', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'test123'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();
  });

  test('Login fail - wrong password', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Incorrect password');
  });

  test('Login fail - missing user', async () => {
    const res = await request(app).post('/login').send({
      email: 'nouser@example.com',
      password: 'test123'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('User not found');
  });
});