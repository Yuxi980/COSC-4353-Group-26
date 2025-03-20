const request = require('supertest');
const { app, server } = require('../userProfile');




jest.setTimeout(15000);




beforeEach(async () => {
  await request(app).delete('/profile'); // Clear existing profiles before each test
});




describe('Profile Management API Tests', () => {
 
  it('should create a new profile successfully', async () => {
    const res = await request(app)
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
    const res = await request(app)
      .post('/profile')
      .send({
        fullName: '',
        address: '',
        city: 'Test City',
        state: 'TC',
        zipCode: 'ABCDE',
        skills: [],
        availability: []
      });
    expect(res.statusCode).toEqual(400);
  });




  it('should get an existing profile', async () => {
    await request(app)
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




    const res = await request(app).get('/profile');
    expect(res.statusCode).toEqual(200);
    expect(res.body[0].fullName).toEqual('Profile User');
  });
});




// Properly close the server after all tests
afterAll(async () => {
  if (server && server.close) {
    await new Promise((resolve) => server.close(resolve));
  }
});

