const express = require("express");
const Message = require("../models/message"); // Import the Message model
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// POST route to create a new message
router.post("/send", authMiddleware, async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;

        // Find the message document between the two participants
        let messageDoc = await Message.findOne({ participants: { $all: [sender, receiver] } });

        if (!messageDoc) {
            // If no document exists, create a new one
            messageDoc = new Message({ participants: [sender, receiver], messages: [] });
        }

        // Push the new message to the messages array
        messageDoc.messages.push({
            content,
            sender,
            timestamp: new Date(),
        });

        // Sort the messages array by timestamp in FIFO manner
        messageDoc.messages.sort((a, b) => a.timestamp - b.timestamp);

        // Save the updated document
        const savedMessageDoc = await messageDoc.save();

        res.status(201).json(savedMessageDoc); // Send back the saved message document
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get messages between two users
router.get("/:senderId/:receiverId", authMiddleware, async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Find the message document between the two participants
        const messageDoc = await Message.findOne({ participants: { $all: [senderId, receiverId] } });

        if (!messageDoc) {
            return res.status(404).json({ error: "Messages not found" });
        }

        res.status(200).json(messageDoc.messages); // Send back the messages array
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific message by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).send();
        }
        res.status(200).send(message);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update a specific message by ID
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!message) {
            return res.status(404).send();
        }
        res.status(200).send(message);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Delete a specific message by ID
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).send();
        }
        res.status(200).send(message);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;