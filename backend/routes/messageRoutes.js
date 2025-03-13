const express = require("express");
const Message = require("../models/message"); // Import the Message model
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Protect this route so only authenticated users can send messages
router.post("/send", authMiddleware, async (req, res) => {
    try {
        const newMessage = new Message({
            sender: req.user.id, // Use authenticated user's ID
            receiver: req.body.receiver,
            content: req.body.content,
        });

        const savedMessage = await newMessage.save(); // Save the message to the database
        res.status(201).json(savedMessage); // Send back the saved message
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Protect this route to ensure only logged-in users fetch messages
router.get("/:senderId/:receiverId", authMiddleware, async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Check if the authenticated user is part of the conversation
        if (req.user.id !== senderId && req.user.id !== receiverId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
});

// Fetch messages where the authenticated user is either sender or receiver
router.get("/", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        }).sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving messages", error });
    }
});

module.exports = router;

/*
const express = require("express");
const Message = require("../models/message"); // Import the Message model
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// POST route to create a new message
router.post("/send", async (req, res) => {
    try {
        const newMessage = new Message({
            sender: req.body.sender,
            receiver: req.body.receiver,
            content: req.body.content,
        });

        const savedMessage = await newMessage.save(); // Save the message to the database
        res.status(201).json(savedMessage); // Send back the saved message
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get messages between two users
router.get("/:senderId/:receiverId", async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
});

// GET all messages for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.id });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving messages", error });
    }
});

module.exports = router;
*/