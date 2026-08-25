const express = require('express');
const todoModel = require('../schemas/TodoModel');
const authMiddleware = require('../Middleware/authMiddleware');
const router = express.Router();
const progressModel = require('../schemas/ProgressModel');
const updateTodayProgress = require('../Middleware/updateProgress')

router.get("/todos", authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.query;
    if (status !== undefined) {
        const statusBoolean = status === 'true';
        try {
            const todos = await todoModel.find({ userId, status: statusBoolean });
            res.status(200).json({ message: "Todos fetched successfully", todos });
        } catch (e) {
            res.status(400).json({ message: "Error in fetching todos", error: e });
        }
    } else {
        try {
            const todos = await todoModel.find({ userId });
            res.status(200).json({ message: "Todos fetched successfully", todos });
        } catch (e) {
            res.status(400).json({ message: "Error in fetching todos", error: e });
        }
    }
});

router.post("/todos", authMiddleware, async (req, res) => {
    const { todo } = req.body;
    try {
        const userId = req.user.userId;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        await progressModel.deleteOne({ userId, day: startOfToday });

        const newTodo = new todoModel({ todo, status: false, userId });

        await newTodo.save();

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
        const deletedTodo = await todoModel.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found or you don't have permission to delete it" });
        }       
        res.status(200).json({ message: "Todo deleted successfully", deletedTodo });
    } catch (e) {
        res.status(400).json({ message: "Error in deleting todo", error: e.message });
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