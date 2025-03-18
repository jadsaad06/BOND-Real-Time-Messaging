const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Get blocked users for the authenticated user
router.get('/blockedUsers', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('blockedUsers', 'username email profilePicture');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve blocked users' });
  }
});

// Block a user
router.post('/blockUser', async (req, res) => {
  const { userIdToBlock } = req.body;

  if (!userIdToBlock) {
    return res.status(400).json({ error: 'User ID to block is required' });
  }

  try {
    const user = await User.findById(req.user.userId);
    const userToBlock = await User.findById(userIdToBlock);

    if (!user || !userToBlock) {
      return res.status(404).json({ error: 'User(s) not found' });
    }

    // Check if the user is already blocked
    if (user.blockedUsers.includes(userIdToBlock)) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    // Add the user to the blocked list
    user.blockedUsers.push(userIdToBlock);
    await user.save();

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock a user
router.delete('/unblockUser', async (req, res) => {
  const { userIdToUnblock } = req.body;

  if (!userIdToUnblock) {
    return res.status(400).json({ error: 'User ID to unblock is required' });
  }

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is not in the blocked list
    if (!user.blockedUsers.includes(userIdToUnblock)) {
      return res.status(400).json({ error: 'User is not blocked' });
    }

    // Remove the user from the blocked list
    user.blockedUsers = user.blockedUsers.filter(id => !id.equals(userIdToUnblock));
    await user.save();

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

module.exports = router;
