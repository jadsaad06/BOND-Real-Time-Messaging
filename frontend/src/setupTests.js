import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: function MockBrowserRouter(props) {
      return jest.requireActual('react').createElement('div', null, props.children);
    }
  };
});

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  }))
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}));

// Create storage mock
const storageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    // Add length and key methods for completeness
    length: jest.fn(() => Object.keys(store).length),
    key: jest.fn(index => Object.keys(store)[index] || null)
  };
})();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: storageMock
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  storageMock.clear();
});

// Make mockNavigate available globally
global.mockNavigate = mockNavigate;