const { DateTime } = require("luxon");

const progressModel = require("../schemas/ProgressModel");
const todoModel = require("../schemas/TodoModel");

const TIMEZONE = "Asia/Kolkata";

const updateTodayProgress = async (userId) => {
    // IST midnight
    const startOfToday = DateTime
        .now()
        .setZone(TIMEZONE)
        .startOf("day");

    // Next IST midnight
    const endOfToday = startOfToday.plus({ days: 1 });

    const todos = await todoModel.find({
        userId,
        createdAt: {
            $gte: startOfToday.toJSDate(),
            $lt: endOfToday.toJSDate()
        }
    });

    const totalTodos = todos.length;

    // No activity today = don't create a progress record
    if (totalTodos === 0) {
        return null;
    }

    const completedCount = todos.filter(
        todo => todo.status === true
    ).length;

    const allCompleted =
        completedCount === totalTodos;

    return await progressModel.findOneAndUpdate(
        {
            userId,
            day: startOfToday.toJSDate()
        },
        {
            userId,
            day: startOfToday.toJSDate(),
            completed: completedCount,
            status: allCompleted
        },
        {
            upsert: true,
            new: true
        }
    );
};

module.exports = updateTodayProgress;