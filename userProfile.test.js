const http = require('http');
const request = require('supertest');

// Import the Express app
const app = require('./app');

// Wrap the Express app in an HTTP server for Supertest
const server = http.createServer(app);

jest.setTimeout(15000);

// Reset the in-memory users array before each test
beforeEach(async () => {
  await request(server).delete('/profile'); // Clear existing profiles
});

describe('Profile Management', () => {

  it('should create a new profile successfully', async () => {
    const res = await request(server)
      .post('/profile')
      .send({
        fullName: 'New User',
        address: '123 Test St',
        city: 'Test City',
        state: 'TC',
        zipCode: '12345',
        skills: ['Event Planning'],
        availability: ['2025-05-10']
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.user.fullName).toEqual('New User');
  });

  it('should not create a profile with missing fields', async () => {
    const res = await request(server)
      .post('/profile')
      .send({
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

  it('should get profile when it exists', async () => {
    await request(server)
      .post('/profile')
      .send({
        fullName: 'Profile User',
        address: '456 Example St',
        city: 'Example City',
        state: 'EX',
        zipCode: '54321',
        skills: ['Teaching'],
        availability: ['2025-07-01']
      });

    const res = await request(server).get('/profile');
    expect(res.statusCode).toEqual(200);
    expect(res.body[0].fullName).toEqual('Profile User');
  });

  it('should update an existing profile', async () => {
    await request(server)
      .post('/profile')
      .send({
        fullName: 'Update User',
        address: '789 Update St',
        city: 'Update City',
        state: 'UP',
        zipCode: '67890',
        skills: ['Cooking'],
        availability: ['2025-04-20']
      });

    const res = await request(server)
      .put('/profile')
      .send({
        fullName: 'Updated Name',
        address: '789 Update St',
        city: 'Update City',
        state: 'UP',
        zipCode: '67890',
        skills: ['Event Planning'],
        availability: ['2025-06-15']
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.fullName).toEqual('Updated Name');
  });

  it('should delete a profile', async () => {
    await request(server)
      .post('/profile')
      .send({
        fullName: 'Delete User',
        address: '101 Remove St',
        city: 'Remove City',
        state: 'RM',
        zipCode: '99999',
        skills: ['First Aid'],
        availability: ['2025-08-30']
      });

    const res = await request(server).delete('/profile');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Profile deleted successfully');
  });

});

// Close the server after all tests complete
afterAll(() => {
  server.close();
});

