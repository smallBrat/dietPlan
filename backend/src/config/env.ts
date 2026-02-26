import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables
// Priority: .env.local (root) > .env (backend) > process.env
const envPath = path.resolve(__dirname, '../../../.env.local');
dotenv.config({ path: envPath });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Zod validation schema for environment variables
const envSchema = z.object({
    // Server
    PORT: z.string().default('5000').pipe(z.coerce.number()),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database
    MONGODB_URI: z
        .string()
        .url('MONGODB_URI must be a valid URL')
        .min(1, 'MongoDB URI is required'),

    // Security
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters long')
        .default(() => {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('JWT_SECRET is required in production');
            }
            console.warn('⚠️  JWT_SECRET not set. Using default for development.');
            return 'dev-secret-key-not-for-production-change-this';
        }),

    // AI
    GEMINI_API_KEY: z
        .string()
        .min(1, 'Gemini API Key is required')
        .describe('Google Gemini API Key for diet plan generation'),

    // Optional
    FRONTEND_URL: z.string().url().optional(),
});

/**
 * Parse and validate environment variables
 * @throws Error if validation fails
 */
const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Environment Validation Failed');
        console.error('');
        const formattedErrors = parsed.error.format();

        Object.entries(formattedErrors).forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && '_errors' in value) {
                console.error(`  ${key}: ${value._errors.join(', ')}`);
            }
        });

        console.error('');
        console.error('📋 Required Environment Variables:');
        console.error('  - MONGODB_URI: MongoDB Atlas connection string');
        console.error('  - JWT_SECRET: Secret key for JWT signing (min 32 chars)');
        console.error('  - GEMINI_API_KEY: Google Gemini API key');
        console.error('  - PORT: Server port (default: 5000)');
        console.error('  - NODE_ENV: development | production | test');
        console.error('');

        process.exit(1);
    }

    const envVars = parsed.data;

    // Log configuration on startup (without secrets)
    console.log('✅ Environment Variables Loaded');
    console.log(`   NODE_ENV: ${envVars.NODE_ENV}`);
    console.log(`   PORT: ${envVars.PORT}`);
    console.log(`   MONGODB_URI: ${envVars.MONGODB_URI.substring(0, 50)}...`);
    console.log(`   GEMINI_API_KEY: ${envVars.GEMINI_API_KEY.substring(0, 10)}...`);

    return envVars;
};

export const env = parseEnv();
