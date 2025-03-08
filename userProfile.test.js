const http = require('http');
const request = require('supertest');

// Import the Express app
const app = require('./app');

// Wrap the Express app in an HTTP server for Supertest
const server = http.createServer(app);

jest.setTimeout(15000);

// Reset the in-memory users array before each test
beforeEach(async () => {
  await request(server).post('/test/reset');
});

describe('Profile Management', () => {

  it('should create a new profile successfully', async () => {
    const res = await request(server)
      .post('/profile')
      .send({
        email: 'newprofile@example.com',
        fullName: 'New User',
        address: '123 Test St',
        city: 'Test City',
        state: 'TC',
        zipCode: '12345',
        skills: ['Event Planning'],
        availability: ['2025-05-10']
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.user.email).toEqual('newprofile@example.com');
  });

  it('should not create a profile with missing fields', async () => {
    const res = await request(server)
      .post('/profile')
      .send({
        email: 'badprofile@example.com',
        fullName: '',
        address: '',
        city: 'Test City',
        state: 'TC',
        zipCode: 'ABCDE', // Invalid zip
        skills: [],
        availability: []
      });
    expect(res.statusCode).toEqual(400);
  });

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
    expect(res.body.email).toEqual('profileuser@example.com');
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

  it('should delete a user profile', async () => {
    await request(server)
      .post('/register')
      .send({
        email: 'deleteuser@example.com',
        password: '123456',
        role: 'volunteer'
      });
    await request(server)
      .post('/profile')
      .send({
        email: 'deleteuser@example.com',
        fullName: 'Delete User',
        address: '456 Remove St',
        city: 'Remove City',
        state: 'RC',
        zipCode: '67890',
        skills: ['Cooking'],
        availability: ['2025-04-20']
      });
    const res = await request(server).delete('/profile/deleteuser@example.com');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Profile deleted successfully');
  });

});

// Close the server after all tests complete
afterAll(() => {
  server.close();
});
