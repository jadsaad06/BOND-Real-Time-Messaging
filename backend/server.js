require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/message");
const User = require("./models/user");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

// Basic test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
