const mongoose = require("mongoose");

// Define the schema for a message
const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Create a model from the schema
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;