const {
    getStartOfISTDay
} = require("../utils/dateUtils");

const updateTodayProgress = async (userId) => {

    const startOfToday = getStartOfISTDay();

    const endOfToday = new Date(startOfToday);

    endOfToday.setUTCDate(
        endOfToday.getUTCDate() + 1
    );

    // Get today's todos
    const todos = await todoModel.find({
        userId,
        createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
        }
    });

    const completedCount = todos.filter(
        todo => todo.status === true
    ).length;

    const totalTodos = todos.length;

    const allCompleted =
        totalTodos > 0 &&
        completedCount === totalTodos;

    // If there are no todos, don't create progress
    if (totalTodos === 0) {
        return null;
    }

    return await progressModel.findOneAndUpdate(
    {
        userId,
        day: startOfToday
    },
    {
        userId,
        day: startOfToday,
        completed: completedCount,
        status: allCompleted,
        attempted: true
    },
    {
        upsert: true,
        new: true
    }
);
};

module.exports = updateTodayProgress;