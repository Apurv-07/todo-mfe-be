const express = require('express');
const userModel = require('../schemas/UserModel');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../Middleware/authMiddleware');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error in token generation",
                        error: err.message
                    });
                }

                const isProduction = process.env.NODE_ENV === 'production';
                res.cookie('token', token, {
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: isProduction ? 'none' : 'lax',
                    secure: isProduction
                });

                return res.status(200).json({
                    message: "Login Successful",
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    },
                    token
                });
            }
        );
    } catch (e) {
        res.status(400).json({ message: "Error in login", error: e })
    }
})

router.post('/registration', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ username, email, password: hashedPassword });
        await user.save();
        res.status(200).json({ message: "User registered successfully", user: { id: user._id, username: user.username, email: user.email } });
    } catch (e) {
        res.status(400).json({ message: "Error in registration", error: e });
    }
});

router.post('/logout', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

router.get("/me", authMiddleware, async (req, res) => {
    const userid = req.user.userId;
    try {
        const user = await userModel.findOne({ _id: userid }).select('-password'); // Exclude password from the response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (e) {
        return res.status(400).json({ message: "Error fetching user data", error: e });
    }
})

module.exports = router;