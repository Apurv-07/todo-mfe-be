const updateTodayProgress = async (userId) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todos = await todoModel.find({
        userId,
        createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
        }
    });

    const totalTodos = todos.length;

    // No activity today.
    // Do NOT create a progress record.
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
            day: startOfToday
        },
        {
            userId,
            day: startOfToday,
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