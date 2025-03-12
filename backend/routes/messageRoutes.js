const express = require("express");
const Message = require("../models/message"); // Import the Message model
const router = express.Router();

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

module.exports = router;