import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DietService } from '../services/diet.service';
import { DietPlan } from '../models/dietPlan.model';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

const dietProfileSchema = z.object({
    age: z.number().int().min(1).max(120),
    gender: z.enum(['Male', 'Female', 'Other']),
    height: z.string().min(1, 'Height is required'),
    weight: z.string().min(1, 'Weight is required'),
    medical_history: z.string().optional().default('None'),
    medications: z.string().optional().default('None'),
    allergies: z.string().optional().default('None'),
    preference: z.enum(['Veg', 'Non-Veg', 'Eggetarian']),
    goal: z.string().min(1, 'Goal is required'),
});

export const generateDiet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next(new AppError('User not authenticated', 401));
        }

        const profile = dietProfileSchema.parse(req.body) as {
            age: number;
            gender: string;
            height: string;
            weight: string;
            medical_history: string;
            medications: string;
            allergies: string;
            preference: string;
            goal: string;
        };

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new AppError('Invalid user ID', 400));
        }

        // Generate diet plan using AI
        const generatedPlan = await DietService.generateDietPlan(profile);

        // Deactivate previous active plans for this user
        await DietPlan.updateMany(
            { user: new mongoose.Types.ObjectId(userId), isActive: true },
            { isActive: false }
        );

        // Get latest version
        const latestPlan = await DietPlan.findOne({
            user: new mongoose.Types.ObjectId(userId),
        }).sort({ version: -1 });

        const newVersion = latestPlan ? latestPlan.version + 1 : 1;

        // Create new diet plan
        const dietPlan = await DietPlan.create({
            user: new mongoose.Types.ObjectId(userId),
            planData: generatedPlan,
            planVersion: 2,
            userInput: profile,
            version: newVersion,
            isActive: true,
            createdBy: userId,
        });

        res.status(201).json({
            status: 'success',
            message: 'Diet plan generated successfully',
            data: {
                dietPlan,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(
                new AppError(
                    `Validation error: ${error.errors.map((e) => `${e.path.join('.')} - ${e.message}`).join('; ')}`,
                    400
                )
            );
        }
        next(error);
    }
};

export const getLatestDiet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next(new AppError('User not authenticated', 401));
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new AppError('Invalid user ID', 400));
        }

        const dietPlan = await DietPlan.findOneAndUpdate(
            { user: new mongoose.Types.ObjectId(userId), isActive: true },
            { $set: { lastAccessedAt: new Date() } },
            { new: true }
        ).populate('user', 'name email phone');

        if (!dietPlan) {
            return next(new AppError('No active diet plan found. Please generate one first.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                dietPlan,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getDietById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next(new AppError('User not authenticated', 401));
        }

        const dietPlanIdRaw = req.params.id ?? req.query.id;
        const dietPlanId = Array.isArray(dietPlanIdRaw)
            ? dietPlanIdRaw[0]
            : dietPlanIdRaw;

        if (!dietPlanId || typeof dietPlanId !== 'string') {
            return next(new AppError('Diet plan ID is required', 400));
        }

        if (!mongoose.Types.ObjectId.isValid(dietPlanId)) {
            return next(new AppError('Invalid diet plan ID', 400));
        }

        const dietPlan = await DietPlan.findById(dietPlanId).populate('user', 'name email phone');

        if (!dietPlan) {
            return next(new AppError('Diet plan not found', 404));
        }

        // Check ownership
        if (dietPlan.user._id.toString() !== userId) {
            return next(new AppError('You do not have permission to access this diet plan', 403));
        }

        res.status(200).json({
            status: 'success',
            data: {
                dietPlan,
            },
        });
    } catch (error) {
        next(error);
    }
};
