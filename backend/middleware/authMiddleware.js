const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("Auth headers:", req.headers.authorization);
    console.log("Token extracted:", token ? token.substring(0, 15) + "..." : "none");

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified, user:", decoded.id || decoded._id || decoded);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        res.status(401).json({ message: "Invalid token" });
    }
};
module.exports = authMiddleware;