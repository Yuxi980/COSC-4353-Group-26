// Events.test.js
const request = require('supertest');
const app = require('./Events'); 

describe('Event API Tests', () => {
        it('should create a new event successfully', async () => {
        const res = await request(server)
          .post('/event')
          .send({
            eventName: 'New Event',
            description: 'This is a test event',
            location: 'Houston, TX',
            skills: ['Event Planning'],
            urgency: 'low',
            date: '03-14-2025'
          });
        expect(res.statusCode).toEqual(201);
        expect(res.body.event.eventName).toEqual('New Event');
      });
      it('should not create an event with missing fields', async () => {
        const res = await request(server)
          .post('/event')
          .send({
            eventName: 'New Event',
            description: 'This is a test event',
            location: 'Houston, TX',
            skills: [], // empty array
            urgency: 'low',
            date: '03-14-2025'
          });
        expect(res.statusCode).toEqual(400);
      });
    
      it('should get event when it exists', async () => {
        await request(server)
          .post('/event')
          .send({
            eventName: 'New Event',
            description: 'This is a test event',
            location: 'Houston, TX',
            skills: ['Event Planning'],
            urgency: 'low',
            date: '03-14-2025'
          });
    
        const res = await request(server).get('/event');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].eventName).toEqual('New Event');
      });
    
      it('should update an existing event', async () => {
        await request(server)
          .post('/event')
          .send({
            eventName: 'New Event',
            description: 'This is a test event',
            location: 'Houston, TX',
            skills: ['Event Planning'],
            urgency: 'low',
            date: '03-14-2025'
          });
    
        const res = await request(server)
          .put('/event')
          .send({
            eventName: 'Updated event name',
            description: 'This is a MODIFIED test event',
            location: 'Los Angeles, CA',
            skills: ['Comma Splicing'],
            urgency: 'low',
            date: '03-14-2025'
          });
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.event.eventName).toEqual('Updated event name');
      });
    
      it('should delete an event', async () => {
        await request(server)
          .post('/event')
          .send({
            eventName: 'New Event',
            description: 'This is a test event',
            location: 'Houston, TX',
            skills: ['Event Planning'],
            urgency: 'low',
            date: '03-14-2025'
          });
    
        const res = await request(server).delete('/event');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Event deleted successfully');
      });
    
    });
    
    // Close the server after all tests complete
    afterAll(() => {
      server.close();
    });
    