# BOND Real-Time Messaging Backend

Node.js/Express backend for BOND, featuring real-time messaging, friend management, and secure user authentication.

## Core Features

### Authentication & Security
- JWT-based authentication
- Two-factor authentication (2FA)  
- Password hashing with bcrypt
- Rate limiting
- CORS protection

### Real-time Communication
- WebSocket messaging with Socket.io
- Typing indicators
- Online/offline status
- Message history

### User Management
- Profile management
- Friend system
- Blocking capabilities 
- Email verification

## Getting Started

### Prerequisites
- Node.js >= 16.x
- MongoDB >= 4.4
- npm >= 7.x

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BOND-Real-Time-Messaging.git
cd BOND-Real-Time-Messaging/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```env
MONGODB_URI=your_uri_here
JWT_SECRET=your_secret_here
```

4. Start development server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── socket/        # WebSocket handlers
│   └── utils/         # Helper functions
├── config/           # Configuration
├── tests/           # Test files
└── server.js        # Entry point
```

## API Documentation

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/verify-2fa` | Verify 2FA code |
| POST | `/api/auth/logout` | Logout user |

### User Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get users |
| GET | `/api/users/:id` | Get user |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Friend Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | Get friends |
| POST | `/api/friends/add/:id` | Add friend |
| DELETE | `/api/friends/:id` | Remove friend |
| POST | `/api/friends/block/:id` | Block user |

### Message Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:chatId` | Get chat history |
| POST | `/api/messages` | Send message |
| DELETE | `/api/messages/:id` | Delete message |

## WebSocket Events

### Connection Events
- `connection` - Client connects
- `disconnect` - Client disconnects

### Message Events
- `message` - New message
- `typing` - User typing
- `stop_typing` - User stopped typing

### Status Events
- `status_change` - User status update
- `online` - User connects
- `offline` - User disconnects

## Database Models

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String, // hashed
  profilePicture: String,
  friends: [ObjectId],
  blockedUsers: [ObjectId],
}
```

### Message Schema
```javascript
{
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  timestamp: Date,
  status: String
}
```

## Testing

Run the test suite:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Error Handling

Standard error response format:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code |

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Submit pull request

## License

MIT License - See [LICENSE](LICENSE) file for details