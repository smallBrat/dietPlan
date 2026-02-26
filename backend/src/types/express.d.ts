import { Request } from 'express';

// Define the User Payload Interface
export interface IUserPayload {
    userId: string;
}

// Extend the Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload;
        }
    }
}
