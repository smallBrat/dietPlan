import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export const signToken = (payload: TokenPayload): string => {
    return jwt.sign({ userId: payload.userId, email: payload.email }, env.JWT_SECRET, {
        expiresIn: '90d',
        algorithm: 'HS256',
    });
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, {
            algorithms: ['HS256'],
        }) as TokenPayload;
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', (error as Error).message);
        return null;
    }
};
