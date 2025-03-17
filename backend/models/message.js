const mongoose = require("mongoose");

const arrayLimit = (val) => val.length <= 2;

// Define the schema for a message
const messageSchema = new mongoose.Schema({
    participants: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} exceeds the limit of 2'],
    },
    messages: [{
        content: {
            type: String,
            required: true,
        },
        sender: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }]
});

// Create a model from the schema
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;