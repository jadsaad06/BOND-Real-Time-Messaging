const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const router = express.Router();
const fs = require('fs');
const dir = './uploads';

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp to avoid conflicts
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload profile picture route
router.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const user = await User.findById(req.query.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    return res.status(200).json({ 
      message: 'Profile picture uploaded successfully', 
      profilePicture: user.profilePicture 
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload profile picture', 
      details: error.message 
    });
  }
});

// Retrieve profile picture for the authenticated user
router.get('/profilePicture', async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    return res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile picture' });
  }
});

// Retrieve profile picture by user ID
router.get('/profilePicture/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.profilePicture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    return res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile picture' });
  }
});

module.exports = router;
