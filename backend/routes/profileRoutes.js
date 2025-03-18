const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const router = express.Router();

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp to avoid conflicts
  },
});

const upload = multer({ storage });

// Upload profile picture route
router.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const user = await User.findById(req.user.userId);
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: 'Profile picture uploaded successfully', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Retrieve profile picture for the authenticated user
router.get('/profilePicture', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile picture' });
  }
});

// Retrieve profile picture by user ID
router.get('/profilePicture/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user || !user.profilePicture) {
        return res.status(404).json({ error: 'Profile picture not found' });
      }
  
      res.status(200).json({ profilePicture: user.profilePicture });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve profile picture' });
    }
  });
  
module.exports = router;
