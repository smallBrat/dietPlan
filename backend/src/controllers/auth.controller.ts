import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format (E.164 required)')
        .optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, phone } = registerSchema.parse(req.body);
        const normalizedPhone = phone && phone.trim().length > 0 ? phone : undefined;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already registered', 409));
        }

        // Create user (password will be hashed by pre-save middleware)
        const user = await User.create({
            name,
            email,
            password,
            phone: normalizedPhone || null,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(
                new AppError(
                    `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
                    400
                )
            );
        }
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // Find user and explicitly select password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.warn(`⚠️  Login failed: user not found for email ${email}`);
            return next(new AppError('Invalid email or password', 401));
        }

        // Compare passwords using bcrypt compare
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            console.warn(`⚠️  Login failed: invalid password for email ${email}`);
            return next(new AppError('Invalid email or password', 401));
        }

        // Generate token
        const token = signToken({ userId: user._id.toString(), email: user.email });

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(
                new AppError(
                    `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
                    400
                )
            );
        }
        console.error('❌ Login error:', error);
        next(error);
    }
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next(new AppError('User not authenticated', 401));
        }

        const user = await User.findById(userId).select('name email phone');
        if (!user) {
            return next(new AppError('User not found', 401));
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        next(error);
    }
};
