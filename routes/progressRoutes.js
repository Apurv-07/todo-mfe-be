const express = require('express');
const progressModel = require('../schemas/ProgressModel');
const authMiddleware = require('../Middleware/authMiddleware');
const progressrouter = express.Router();
const updateTodayProgress = require('../Middleware/updateProgress');


const { getStartOfISTDay } = require("../Middleware/ITCHelper");

progressrouter.get("/progress", authMiddleware, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Update today's progress from today's actual todos
        await updateTodayProgress(userId);

        const now = new Date();

        const year =
            Number(req.query.year) || now.getFullYear();

        const month =
            Number(req.query.month) || now.getMonth() + 1;

        if (month < 1 || month > 12) {
            return res.status(400).json({
                message: "Invalid month"
            });
        }

        const startOfMonth = new Date(
            year,
            month - 1,
            1
        );

        startOfMonth.setHours(0, 0, 0, 0);

        const startOfNextMonth = new Date(
            year,
            month,
            1
        );

        startOfNextMonth.setHours(0, 0, 0, 0);

        const results = await progressModel
            .find({
                userId,
                day: {
                    $gte: startOfMonth,
                    $lt: startOfNextMonth
                }
            })
            .sort({ day: 1 });

        res.status(200).json({
            message: "Progress fetched successfully",
            results,
            month: {
                year,
                month
            }
        });

    } catch (e) {

        console.error(
            "GET PROGRESS ERROR:",
            e.message
        );

        res.status(500).json({
            message: "Error in fetching progress",
            error: e.message
        });
    }
});


module.exports = progressrouter;
