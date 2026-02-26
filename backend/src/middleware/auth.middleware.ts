import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

/**
 * JWT Authentication Middleware
 * Verifies token and attaches user info to request
 * Usage: app.use(protect) for protected routes
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        // Extract token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return next(
                new AppError('You are not authenticated! Please log in to continue.', 401)
            );
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return next(new AppError('Invalid or expired token. Please log in again.', 401));
        }

        // Attach user info to request
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(new AppError('Authentication failed. Please try again.', 401));
    }
};
