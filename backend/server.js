require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const Message = require("./models/message");
const User = require("./models/user");
const { Server } = require("socket.io");
const http = require("http");
const multer = require("multer");
const path = require("path");

const app = express();

const server = http.createServer(app); // Create HTTP server for WebSockets
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow frontend to connect
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));  // Serve profile pictures from 'uploads' directory

// MongoDB Connection with error handling
mongoose.connect(process.env.DB_KEY)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/profile', profileRoutes);

// Basic test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room based on user ID
  socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
  });

  // Handle sending messages
  socket.on("sendMessage", (data) => {
      const { sender, receiver, content } = data;

      // Emit message to receiver's room
      io.to(receiver).emit("receiveMessage", {
          sender,
          content,
          timestamp: new Date()
      });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
