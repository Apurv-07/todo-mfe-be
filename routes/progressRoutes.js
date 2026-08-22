const express = require('express');
const progressrouter = express.Router();
const progressModel = require('../schemas/ProgressModel');
const authMiddleware = require('../Middleware/authMiddleware');

const express = require('express');
const progressrouter = express.Router();

const progressModel = require('../schemas/ProgressModel');
const authMiddleware = require('../Middleware/authMiddleware');
const updateTodayProgress = require('../helpers/updateTodayProgress');


progressrouter.get("/progress", authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const limit = Math.min(
        parseInt(req.query.limit) || 30,
        100
    );
    const before = req.query.before
        ? new Date(req.query.before)
        : null;

    try {
        const latestProgress = await progressModel
            .findOne({ userId })
            .sort({ day: -1 });
        if (latestProgress) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastDay = new Date(latestProgress.day);
            lastDay.setHours(0, 0, 0, 0);
            const missingDays = [];
            const currentDay = new Date(lastDay);
            currentDay.setDate(currentDay.getDate() + 1);
            while (currentDay < today) {
                missingDays.push({
                    userId,
                    day: new Date(currentDay),
                    completed: 0,
                    status: false
                });
                currentDay.setDate(
                    currentDay.getDate() + 1
                );
            }
            if (missingDays.length > 0) {
                await progressModel.insertMany(
                    missingDays,
                    {
                        ordered: false
                    }
                );
            }
        }

        await updateTodayProgress(userId);
        const query = {
            userId
        };
        if (before && !isNaN(before.getTime())) {

            query.day = {
                $lt: before
            };
        }
        const results = await progressModel
            .find(query)
            .sort({ day: -1 })
            .limit(limit + 1);
        const hasMore = results.length > limit;
        if (hasMore) {
            results.pop();
        }
        const nextCursor = hasMore
            ? results[results.length - 1].day
            : null;


        res.status(200).json({
            message: "Progress fetched successfully",
            results,
            pagination: {
                limit,
                hasMore,
                nextCursor
            }
        });

    } catch (e) {

        console.error("GET PROGRESS ERROR:", e);

        res.status(500).json({
            message: "Error in fetching progress",
            error: e.message
        });
    }
});


module.exports = progressrouter;
