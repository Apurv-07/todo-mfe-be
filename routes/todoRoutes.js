const express = require('express');
const todoModel = require('../schemas/TodoModel');
const authMiddleware = require('../Middleware/authMiddleware');
const router = express.Router();
const progressModel = require('../schemas/ProgressModel');
const updateTodayProgress = require('../Middleware/updateProgress')

router.get("/todos", authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.query;

    try {
        const now = new Date();

        // Get today's date in IST
        const istDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(now);

        // IST midnight -> UTC
        const startOfDay = new Date(`${istDate}T00:00:00+05:30`);

        // Tomorrow's IST midnight -> UTC
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const query = {
            userId,
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        };

        if (status !== undefined) {
            query.status = status === "true";
        }

        const todos = await todoModel.find(query);

        res.status(200).json({
            message: "Todos fetched successfully",
            todos,
        });
    } catch (e) {
        res.status(400).json({
            message: "Error in fetching todos",
            error: e,
        });
    }
});

router.get("/todos/date/:date", authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { date } = req.params;

    try {
        // Validate YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD",
            });
        }

        // Start of requested day in IST
        const startOfDay = new Date(`${date}T00:00:00+05:30`);

        if (isNaN(startOfDay.getTime())) {
            return res.status(400).json({
                message: "Invalid date",
            });
        }

        // Start of next day in IST
        const endOfDay = new Date(
            startOfDay.getTime() + 24 * 60 * 60 * 1000
        );

        const todos = await todoModel.find({
            userId,
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        res.status(200).json({
            message: "Todos fetched successfully",
            todos,
        });
    } catch (e) {
        res.status(400).json({
            message: "Error in fetching todos",
            error: e,
        });
    }
});

router.post("/todos", authMiddleware, async (req, res) => {
    const { todo } = req.body;

    try {
        const userId = req.user.userId;

        const newTodo = new todoModel({
            todo,
            status: false,
            userId
        });

        await newTodo.save();

        await updateTodayProgress(userId);

        res.status(200).json({
            message: "Todo created successfully",
            newTodo
        });

    } catch (e) {
        res.status(400).json({
            message: "Error in creating todo",
            error: e.message
        });
    }
});

router.delete("/todos/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const userId = req.user.userId;

        const deletedTodo = await todoModel.findOneAndDelete({
            _id: id,
            userId
        });

        if (!deletedTodo) {
            return res.status(404).json({
                message: "Todo not found or you don't have permission to delete it"
            });
        }

        await updateTodayProgress(userId);

        res.status(200).json({
            message: "Todo deleted successfully",
            deletedTodo
        });

    } catch (e) {
        res.status(400).json({
            message: "Error in deleting todo",
            error: e.message
        });
    }
});

router.put("/todos/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { todo, status } = req.body;

    try {
        const userId = req.user.userId;

        const updatedTodo = await todoModel.findOneAndUpdate(
            {
                _id: id,
                userId
            },
            {
                todo,
                status
            },
            {
                new: true
            }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: "Todo not found or you don't have permission to update it"
            });
        }

        await updateTodayProgress(userId);

        res.status(200).json({
            message: "Todo updated successfully",
            updatedTodo
        });

    } catch (e) {
        console.error("UPDATE TODO ERROR:", e);

        res.status(500).json({
            message: "Error in updating todo",
            error: e.message
        });
    }
});   

module.exports = router;