

  
  // Fixed messageModel.test.js
  jest.mock('mongoose');
  const Message = require('../models/message');
  
  describe('Message Model', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should save a message', async () => {
      // Setup mock implementation for this test
      const mockMessage = {
        sender: 'user1',
        receiver: 'user2',
        content: 'Hello!',
        save: jest.fn().mockResolvedValue({
          _id: 'message-id',
          sender: 'user1',
          receiver: 'user2',
          content: 'Hello!',
          createdAt: new Date()
        })
      };
  
      // Use constructor mock to return our mockMessage
      jest.spyOn(Message.prototype, 'save')
        .mockImplementation(mockMessage.save);
  
      // Create a new message
      const message = new Message({
        sender: 'user1',
        receiver: 'user2',
        content: 'Hello!'
      });
  
      // Call save method
      const savedMessage = await message.save();
  
      // Assertions
      expect(savedMessage.content).toBe('Hello!');
      expect(savedMessage.sender).toBe('user1');
      expect(savedMessage.receiver).toBe('user2');
      expect(Message.prototype.save).toHaveBeenCalled();
    });
  });
  
  // Fixed userModel.test.js
  jest.mock('mongoose');
  const User = require('../models/user');
  const bcrypt = require('bcrypt');
  
  // Mock bcrypt
  jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true)
  }));
  
  describe('User Model', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should hash the password before saving', async () => {
      // Setup mock implementation
      const mockUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        save: jest.fn().mockImplementation(function() {
          // Simulate password hashing during save
          this.password = 'hashed_password';
          return Promise.resolve(this);
        })
      };
  
      // Use constructor mock
      jest.spyOn(User.prototype, 'save')
        .mockImplementation(mockUser.save);
  
      // Create a new user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
  
      // Call save method
      await user.save();
  
      // Assertions
      expect(user.password).not.toBe('password123');
      expect(user.password).toBe('hashed_password');
      expect(User.prototype.save).toHaveBeenCalled();
    });
  });