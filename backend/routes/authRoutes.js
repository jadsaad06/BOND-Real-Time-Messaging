const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

// Route to register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use" });

        const newUser = new User({ username, email, password });
        await newUser.save();

        // Generate JWT
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ message: "User registered successfully", token, user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Route to login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
});

// Get all users (for adding friends)
router.get("/users", async (req, res) => {
    const username = req.body;

    try {
        const users = await User.find(username).select("-password"); // Exclude password
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
});

// Search for users by username
router.get("/users/search", async (req, res) => {
    try {
        const searchQuery = req.query.username;
        
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Create a case-insensitive regex pattern that matches usernames starting with the search query
        const regex = new RegExp(`^${searchQuery}`, 'i');
        
        const users = await User.find({ 
            username: regex
        })
        .select("username email profilePicture")
        .limit(10); // Limit results to 10 users

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error searching users", error });
    }
});

// Get a single user by ID
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
});

// Get friends
router.get("/users/:id/friends", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("friends", "username email");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user.friends);
    } catch (error) {
        res.status(500).json({ message: "Error fetching friends list", error });
    }
});

// GET authenticated user's profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password"); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
    }
});

// PUT route to add/remove a friend
router.patch("/friends/:friendId", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.userId; // Normalize to string
        const { friendId } = req.params;

        // Validate friendId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid friend ID." });
        }

        // Prevent users from adding themselves
        if (userId === friendId) {
            await session.abortTransaction();
            return res.status(400).json({ message: "You cannot add yourself as a friend." });
        }

        // Fetch both users within the session
        const user = await User.findById(userId).session(session);
        const friend = await User.findById(friendId).session(session);

        // Check if both users exist
        if (!user || !friend) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found." });
        }

        // Normalize friends lists to strings (just in case)
        user.friends = user.friends.map(id => id.toString());
        friend.friends = friend.friends.map(id => id.toString());

        const isFriend = user.friends.includes(friendId);

        if (isFriend) {
            // Remove friend (Unfriend)
            user.friends = user.friends.filter(id => id !== friendId);
            friend.friends = friend.friends.filter(id => id !== userId);
        } else {
            // Add friend
            user.friends.push(friendId);
            friend.friends.push(userId);
        }

        // Save both users within transaction
        await user.save({ session });
        await friend.save({ session });

        // Commit transaction
        await session.commitTransaction();

        res.json({
            message: isFriend ? "Friend removed" : "Friend added",
            friends: user.friends
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error updating friends list:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        session.endSession();
    }
});

// DELETE route to remove a friend
router.delete("/friends/:friendId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Get authenticated user's ID
        const { friendId } = req.params;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found." });
        }

        // Remove friend from both users' friend lists
        user.friends = user.friends.filter((id) => id.toString() !== friendId);
        friend.friends = friend.friends.filter((id) => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.json({ message: "Friend removed successfully", friends: user.friends });
    } catch (error) {
        res.status(500).json({ message: "Error removing friend", error });
    }
});

module.exports = router;