// __mocks__/mongoose.js
const mockSchema = {
    pre: jest.fn().mockReturnThis(),
    methods: {},
    statics: {}
  };
  
  const mongoose = {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      close: jest.fn().mockResolvedValue(true)
    },
    Schema: jest.fn().mockImplementation(() => mockSchema),
    model: jest.fn().mockImplementation(() => {
      // Create model constructor function
      function MockModel(data) {
        Object.assign(this, data);
      }
      
      // Add the save method to prototype
      MockModel.prototype.save = jest.fn().mockImplementation(function() {
        return Promise.resolve(this);
      });
      
      // Add static methods
      MockModel.findOne = jest.fn();
      MockModel.findById = jest.fn();
      MockModel.create = jest.fn();
      
      return MockModel;
    })
  };
  
// Mock for your User model
jest.mock('../models/user', () => {
    function User(data) {
      Object.assign(this, data);
    }
    
    // Add methods
    User.prototype.comparePassword = jest.fn().mockResolvedValue(true);
    User.prototype.save = jest.fn().mockImplementation(function() {
      // Simulate password hashing
      this.password = 'hashed_password';
      return Promise.resolve(this);
    });
    
    // Add static methods
    User.findOne = jest.fn();
    User.findById = jest.fn();
    User.create = jest.fn();
    
    return User;
  });

  module.exports = mongoose;