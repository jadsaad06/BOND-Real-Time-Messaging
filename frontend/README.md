# BOND Real-Time Messaging Frontend

A modern React-based messaging application featuring real-time chat, friend management, and user customization.

## Features

- **Real-time Messaging**
  - Instant message delivery
  - Typing indicators
  - Message history
  - Profile pictures in chat

- **Friend Management**
  - Add/Remove friends
  - Block users
  - Search functionality
  - Friend status indicators

- **User Settings**
  - Profile customization
  - Two-factor authentication
  - Email/Password management
  - Theme settings

## Prerequisites

- Node.js >= 16.x
- npm >= 7.x
- Backend server running on port 5000

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Run tests:
```bash
npm test
```

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/     # React components
│   │   ├── Login/     # Authentication
│   │   ├── MainApp/   # Main application
│   │   └── Settings/  # User settings
│   │   └── Register/  # User registration
│   ├── tests/         # Test files
├── package.json
└── README.md
```

## Key Components

### Authentication
- Login with email/password
- Registration system
- Two-factor authentication
- Password recovery

### Main Application
- Real-time chat interface
- Friend management
- Profile customization
- Settings management

### Settings
- Profile picture upload
- Password change
- Email management
- Two-factor authentication toggle
- Block list management

## Testing

The project uses Jest and React Testing Library for testing. Run tests with:

```bash
npm test
```

Key test files:
- `Login.test.jsx`
- `MainApp.test.jsx`
- `Settings.test.jsx`

## Available Scripts

- `npm start` - Run development server
- `npm test` - Run test suite
- `npm run build` - Create production build
- `npm run eject` - Eject from Create React App

## Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Dependencies

Key dependencies:
- React 18
- Socket.io-client
- Axios
- React Router DOM
- React Icons
- Jest
- Testing Library

## Development Guidelines

1. Follow the existing component structure
2. Write tests for new features
3. Use functional components with hooks
4. Follow ESLint rules
5. Add proper TypeScript types

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details