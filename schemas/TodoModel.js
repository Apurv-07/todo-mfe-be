const mongoose = require('mongoose')
const todoSchema = new mongoose.Schema({
    todo: {
        type: String,
        maxLength: [100, 'Product code cannot exceed 100 characters']
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
}, {
    timestamps: {
        createdAt: false,
        updatedAt: true
    }
})
const todoModel = mongoose.model('todo', todoSchema)
module.exports = todoModel;