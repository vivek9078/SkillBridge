const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: String,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'submitted', 'approved', 'rejected'],
        default: 'todo'
    },
    submissionLink: {
        type: String,
        default: ''
    },
    feedback: {
        type: String,
        default: ''
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', taskSchema);