import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import dietRoutes from './routes/diet.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import { AppError } from './utils/AppError';

const app: Application = express();

// ========================================
// TRUST PROXY (if behind reverse proxy)
// ========================================
app.set('trust proxy', 1);

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// Helmet - Set security HTTP headers
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        hsts: {
            maxAge: 31536000, // 1 year in seconds
            includeSubDomains: true,
            preload: true,
        },
    })
);

// CORS - Allow cross-origin requests
app.use(
    cors({
        origin: process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL || '*'] : '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ========================================
// BODY PARSING MIDDLEWARE
// ========================================
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ========================================
// REQUEST LOGGING MIDDLEWARE
// ========================================
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ========================================
// HEALTH CHECK ENDPOINT
// ========================================
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: '✅ MediDiet Backend is Running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// ========================================
// API ROUTES
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// ========================================
// 404 HANDLER
// ========================================
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const errorMessage = `Cannot find ${req.originalUrl} on this server!`;
    next(new AppError(errorMessage, 404));
});

// ========================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ========================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    // Don't log secrets or sensitive information
    const sanitizedError = {
        message: err.message,
        statusCode,
        status,
    };

    console.error(
        `[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.path} - ${err.message}`
    );

    // Development error response includes stack trace
    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            status,
            message: err.message,
            error: err,
            stack: err.stack,
            timestamp: new Date().toISOString(),
        });
    } else {
        // Production error response (no stack trace)
        res.status(statusCode).json({
            status,
            message: err.message || 'Internal Server Error',
            timestamp: new Date().toISOString(),
        });
    }
});

export default app;
