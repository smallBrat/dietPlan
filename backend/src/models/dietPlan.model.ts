import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planData: {
        type: mongoose.Schema.Types.Mixed, // Storing strict JSON structure here
        required: true,
    },
    planVersion: {
        type: Number,
        required: true,
        default: 1,
    },
    userInput: {
        type: mongoose.Schema.Types.Mixed, // Store the input parameters used to generate this plan
        required: true,
    },
    version: {
        type: Number,
        required: true,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: String,
        default: 'system', // or specific admin ID
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index to help find active plans for a user quickly
dietPlanSchema.index({ user: 1, isActive: 1 });

export const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
