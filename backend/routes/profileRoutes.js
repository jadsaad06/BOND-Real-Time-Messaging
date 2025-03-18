const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const User = require("../models/user");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-profile-picture", upload.single("image"), async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload_stream(
            { folder: "profile_pictures" },
            async (error, result) => {
                if (error) return res.status(500).json({ error: error.message });

                await User.findByIdAndUpdate(req.user.id, { profilePicture: result.secure_url });
                res.json({ message: "Profile picture updated", url: result.secure_url });
            }
        ).end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
