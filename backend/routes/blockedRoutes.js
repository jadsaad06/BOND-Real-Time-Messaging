const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Get blocked users for the authenticated user
router.get('/users/:userId/blocklist', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('blockedUsers', 'username email profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.blockedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve blocked users' });
  }
});

// Block a user
router.post('/users/:userId/block/:blockId', async (req, res) => {
  const { userId, blockId } = req.params;

  if (!userId || !blockId) {
    return res.status(400).json({ message: 'User ID and block ID are required' });
  }

  try {
    const user = await User.findById(userId);
    const userToBlock = await User.findById(blockId);

    if (!user || !userToBlock) {
      return res.status(404).json({ message: 'User(s) not found' });
    }

    // Check if the user is already blocked
    if (user.blockedUsers && user.blockedUsers.includes(blockId)) {
      return res.status(400).json({ message: 'User already blocked' });
    }

    // Initialize blockedUsers array if it doesn't exist
    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    // Add the user to the blocked list
    user.blockedUsers.push(blockId);
    await user.save();

    // Remove from friends if they were friends
    if (user.friends && user.friends.includes(blockId)) {
      user.friends = user.friends.filter(friendId => !friendId.equals(blockId));
      await user.save();
    }

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to block user' });
  }
});

// Unblock a user
router.delete('/users/:userId/block/:blockId', async (req, res) => {
  const { userId, blockId } = req.params;

  if (!userId || !blockId) {
    return res.status(400).json({ message: 'User ID and block ID are required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is not in the blocked list
    if (!user.blockedUsers || !user.blockedUsers.includes(blockId)) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    // Remove the user from the blocked list
    user.blockedUsers = user.blockedUsers.filter(id => !id.equals(blockId));
    await user.save();

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});

// Search users endpoint (needed for block functionality)
router.get('/users/search', async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ message: 'Username search term is required' });
  }
  
  try {
    // Find users whose username contains the search term (case insensitive)
    const users = await User.find({
      username: { $regex: username, $options: 'i' }
    }).select('username email profilePicture');
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users' });
  }
});

module.exports = router;