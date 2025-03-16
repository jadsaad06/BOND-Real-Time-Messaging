const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require("../middleware/authMiddleware");

const jwt = require("jsonwebtoken");

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
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "User registered successfully", token, user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
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
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email); // Debug log

        // Send response with user data
        res.json({
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                friends: user.friends,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get all users (for adding friends)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
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
        const user = await User.findById(req.user.id).select("-password"); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error });
    }
});

// PUT route to add/remove a friend
router.put("/friends/:friendId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get authenticated user's ID
        const { friendId } = req.params;

        // Prevent users from adding themselves
        if (userId === friendId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend." });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if friend is already in the list
        const isFriend = user.friends.includes(friendId);

        if (isFriend) {
            // Remove friend (Unfriend)
            user.friends = user.friends.filter((id) => id.toString() !== friendId);
            friend.friends = friend.friends.filter((id) => id.toString() !== userId);
        } else {
            // Add friend
            user.friends.push(friendId);
            friend.friends.push(userId);
        }

        await user.save();
        await friend.save();

        res.json({ message: isFriend ? "Friend removed" : "Friend added", friends: user.friends });
    } catch (error) {
        res.status(500).json({ message: "Error updating friends list", error });
    }
});

// DELETE route to remove a friend
router.delete("/friends/:friendId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get authenticated user's ID
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