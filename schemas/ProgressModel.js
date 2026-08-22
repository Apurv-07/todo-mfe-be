const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    completed: {
        type: Number,
        default: 0
    },

    status: {
        type: Boolean,
        default: false
    },

    day: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

progressSchema.index(
    { userId: 1, day: 1 },
    { unique: true }
);

const progressModel = mongoose.model('progress', progressSchema);

module.exports = progressModel;