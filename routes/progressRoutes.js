const express = require('express');
const progressModel = require('../schemas/ProgressModel');
const authMiddleware = require('../Middleware/authMiddleware');
const progressrouter = express.Router();
const updateTodayProgress = require('../Middleware/updateProgress');


const { getStartOfISTDay } = require("../Middleware/ITCHelper");

progressrouter.get(
    "/progress",
    authMiddleware,
    async (req, res) => {

        const userId = req.user.userId;

        try {
            const today = getStartOfISTDay();
            const latestProgress = await progressModel
                .findOne({ userId })
                .sort({ day: -1 });

            if (latestProgress) {
                const lastDay = getStartOfISTDay(
                    latestProgress.day
                );
                const missingDays = [];
                const currentDay = new Date(lastDay);
                // Move to next IST day
                currentDay.setUTCDate(
                    currentDay.getUTCDate() + 1
                );

                while (currentDay < today) {
                    missingDays.push({
                        userId,
                        day: new Date(currentDay),
                        completed: 0,
                        status: false,
                        attempted: false
                    });

                    currentDay.setUTCDate(
                        currentDay.getUTCDate() + 1
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

            const now = new Date();
            const istParts =
                new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit"
                }).formatToParts(now);

            const currentYear = Number(
                istParts.find(
                    p => p.type === "year"
                ).value
            );

            const currentMonth = Number(
                istParts.find(
                    p => p.type === "month"
                ).value
            );

            const year =
                Number(req.query.year) || currentYear;

            const month =
                Number(req.query.month) || currentMonth;


            if (
                !Number.isInteger(year) ||
                month < 1 ||
                month > 12
            ) {
                return res.status(400).json({
                    message: "Invalid month"
                });
            }
            const startOfMonth = new Date(
                Date.UTC(
                    year,
                    month - 1,
                    1
                ) - (5.5 * 60 * 60 * 1000)
            );
            const startOfNextMonth = new Date(
                Date.UTC(
                    year,
                    month,
                    1
                ) - (5.5 * 60 * 60 * 1000)
            );
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

                message:
                    "Progress fetched successfully",

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

                message:
                    "Error in fetching progress",

                error: e.message

            });
        }
    }
);


module.exports = progressrouter;
