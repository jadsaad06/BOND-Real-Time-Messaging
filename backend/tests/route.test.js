// route.test.js
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');

// Mock the models and dependencies
jest.mock('../models/message');
jest.mock('../models/user');
jest.mock('mongoose');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Create shared mock utilities
const createMockApp = () => {
  const app = express();
  // Mock response methods
  jest.spyOn(express.response, 'status').mockReturnThis();
  jest.spyOn(express.response, 'json').mockReturnThis();
  return app;
};

const generateTestToken = () => {
  return jwt.sign({ id: 'test-user-id' }, process.env.JWT_SECRET || 'test-secret');
};

// =========== Message Routes Tests ===========
describe('Message Routes', () => {
  let messageApp, token;
  
  beforeAll(() => {
    // Create a separate app instance for message routes
    messageApp = createMockApp();
    
    // Create mock message routes
    const mockMessageRoutes = require('../routes/messageRoutes');
    messageApp.use('/messages', mockMessageRoutes);
    
    // Create a test token
    token = generateTestToken();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a message', async () => {
    // Mock request handling
    const mockResponse = {
      _id: 'message-id',
      sender: 'user1',
      receiver: 'user2',
      content: 'Hello!',
      createdAt: new Date()
    };

    // Update mock to return our data
    express.response.json.mockImplementation(() => mockResponse);

    // Make request
    const response = await request(messageApp)
      .post('/messages/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ sender: 'user1', receiver: 'user2', content: 'Hello!' });

    // Check response
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('content', 'Hello!');
  });

  it('should retrieve messages between two users', async () => {
    // Mock messages data
    const mockMessages = [
      { 
        _id: 'message-id-1', 
        sender: 'user1', 
        receiver: 'user2', 
        content: 'Hello!',
        createdAt: new Date()
      },
      { 
        _id: 'message-id-2', 
        sender: 'user2', 
        receiver: 'user1', 
        content: 'Hi there!',
        createdAt: new Date() 
      }
    ];

    // Update mock to return our data
    express.response.json.mockImplementation(() => mockMessages);

    // Make request
    const response = await request(messageApp)
      .get('/messages/user1/user2')
      .set('Authorization', `Bearer ${token}`);

    // Check response
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });
});

// =========== Auth Routes Tests ===========
describe('Auth Routes', () => {
  let authApp;

  beforeAll(() => {
    // Create a separate app instance for auth routes
    authApp = createMockApp();
    
    // Create mock auth routes
    const mockAuthRoutes = require('../routes/authRoutes');
    authApp.use('/auth', mockAuthRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    // Setup mock user creation
    const mockUser = {
      _id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password'
    };

    // Mock User.create to return our mock user
    User.create.mockResolvedValue(mockUser);
    
    // Mock JWT sign to return a token
    jwt.sign.mockReturnValue('mock-token');

    // Mock bcrypt hash
    bcrypt.hash.mockResolvedValue('hashed_password');

    // Mock response
    express.response.json.mockImplementation(() => ({
      user: mockUser,
      token: 'mock-token'
    }));

    // Make request
    const response = await request(authApp)
      .post('/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

    // Check response
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    // Setup mock user
    const mockUser = {
      _id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password'
    };

    // Mock User.findOne to return our mock user
    User.findOne.mockResolvedValue(mockUser);
    
    // Mock JWT sign to return a token
    jwt.sign.mockReturnValue('mock-token');

    // Mock bcrypt compare to return true (password matches)
    bcrypt.compare.mockResolvedValue(true);

    // Mock response
    express.response.json.mockImplementation(() => ({
      token: 'mock-token'
    }));

    // Make request
    const response = await request(authApp)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    // Check response
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token', 'mock-token');
  });
});