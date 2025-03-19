// authMiddleware.test.js
const jwt = require("jsonwebtoken");

// Mock jwt module
jest.mock("jsonwebtoken");

// Import the middleware after mocking
const authMiddleware = require("../middleware/authMiddleware");

describe("Auth Middleware", () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup request, response and next function mocks
    req = { headers: {} };
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    next = jest.fn();
  });

  it("should return an error if no token is provided", () => {
    // Test with no authorization header
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("should return an error if token format is invalid", () => {
    // Test with invalid token format
    req.headers.authorization = "InvalidToken";
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should verify a valid token", () => {
    // Setup valid token
    const userId = "12345";
    const token = "valid-token";
    req.headers.authorization = `Bearer ${token}`;
    
    // Mock JWT verification to return valid payload
    jwt.verify.mockImplementation((token, secret, callback) => {
      return { id: userId };
    });
    
    // Call middleware
    authMiddleware(req, res, next);
    
    // Check that middleware added user to request and called next
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(userId);
    expect(next).toHaveBeenCalled();
  });

  it("should handle invalid tokens", () => {
    // Setup invalid token
    req.headers.authorization = "Bearer invalid-token";
    
    // Mock JWT verification to throw error
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });
    
    // Call middleware
    authMiddleware(req, res, next);
    
    // Check error response
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});