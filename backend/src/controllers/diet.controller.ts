import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DietService } from '../services/diet.service';
import { DietPlan } from '../models/dietPlan.model';
import { AppError } from '../utils/AppError';
import { generateDietPDF } from '../utils/pdfGenerator';
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

export const downloadDietPDF = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: dietPlanId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Validate that dietPlanId is a string
        if (!dietPlanId || Array.isArray(dietPlanId)) {
            res.status(400).json({ message: 'Invalid diet plan ID' });
            return;
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(dietPlanId)) {
            res.status(400).json({ message: 'Invalid diet plan ID' });
            return;
        }

        const dietPlan = await DietPlan.findById(dietPlanId).populate('user', 'name email phone');

        if (!dietPlan) {
            res.status(404).json({ message: 'Diet plan not found' });
            return;
        }

        // Check ownership
        if (dietPlan.user._id.toString() !== userId) {
            res.status(403).json({ message: 'You do not have permission to access this diet plan' });
            return;
        }

        // Ensure planData has required fields
        const planData = dietPlan.planData as any;
        if (!planData || !planData.weekly_plan) {
            res.status(400).json({ message: 'Diet plan data is incomplete' });
            return;
        }

        // Generate PDF with user info
        const user = dietPlan.user as any;
        const pdfData = {
            name: user.name,
            calories_per_day: planData.calories_per_day || 2000,
            veg_or_nonveg: planData.veg_or_nonveg || 'Mixed',
            weekly_plan: planData.weekly_plan,
            precautions: planData.precautions || [],
            disclaimer: planData.disclaimer || 'Consult your healthcare provider before starting any diet plan.',
        };

        // Generate PDF - streams directly to response
        // Generate PDF - streams directly to response
        generateDietPDF(pdfData, res);
    } catch (error) {
        console.error('PDF download error:', error);
        // Only send JSON error if headers haven't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate PDF' });
        }
    }
};
