// utils/dateUtils.js

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

const getStartOfISTDay = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const year = Number(
        parts.find(p => p.type === "year").value
    );

    const month = Number(
        parts.find(p => p.type === "month").value
    );

    const day = Number(
        parts.find(p => p.type === "day").value
    );

    // IST midnight represented as UTC
    return new Date(
        Date.UTC(year, month - 1, day) - IST_OFFSET
    );
};

module.exports = {
    getStartOfISTDay
};