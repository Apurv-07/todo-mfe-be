const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authorizationToken = req.header('Authorization')?.replace('Bearer ', '');
    const token = authorizationToken || req.cookies.token;
    console.log("Token:", token);
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;