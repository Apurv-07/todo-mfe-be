const express = require('express');
const { DateTime } = require("luxon");
const progressModel = require('../schemas/ProgressModel');
const authMiddleware = require('../Middleware/authMiddleware');
const progressrouter = express.Router();
const updateTodayProgress = require('../Middleware/updateProgress');


progressrouter.get("/progress", authMiddleware, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Always determine current date/month using IST
        const now = DateTime.now().setZone("Asia/Kolkata");

        const year =
            Number(req.query.year) || now.year;

        const month =
            Number(req.query.month) || now.month;

        if (month < 1 || month > 12) {
            return res.status(400).json({
                message: "Invalid month"
            });
        }
        await updateTodayProgress(userId);
        const startOfMonth = DateTime.fromObject(
            {
                year,
                month,
                day: 1
            },
            {
                zone: "Asia/Kolkata"
            }
        ).startOf("month");
        const startOfNextMonth =
            startOfMonth.plus({ months: 1 });

        const results = await progressModel
            .find({
                userId,
                day: {
                    $gte: startOfMonth.toJSDate(),
                    $lt: startOfNextMonth.toJSDate()
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
