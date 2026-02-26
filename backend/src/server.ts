import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

const startServer = async () => {
    try {
        console.log('🚀 Starting MediDiet Backend Server...');
        console.log(`📍 Environment: ${env.NODE_ENV}`);

        // Connect to Database
        console.log('');
        await connectDB();

        // Start Express Server
        const PORT = env.PORT || 5000;

        const server = app.listen(PORT, () => {
            console.log('');
            console.log(`✅ Server running successfully`);
            console.log(`   🌐 URL: http://localhost:${PORT}`);
            console.log(`   📍 Environment: ${env.NODE_ENV}`);
            console.log('');
            console.log('Available Endpoints:');
            console.log(`   POST   /api/auth/register      - User registration`);
            console.log(`   POST   /api/auth/login         - User login`);
            console.log(`   POST   /api/diet/generate      - Generate diet plan (protected)`);
            console.log(`   GET    /api/diet/latest        - Get latest diet plan (protected)`);
            console.log(`   GET    /api/diet/:id           - Get diet plan by ID (protected)`);
            console.log(`   POST   /api/whatsapp/query     - WhatsApp query handler`);
            console.log('');
        });

        // Handle graceful shutdown
        const gracefulShutdown = (signal: string) => {
            console.log(`\n📍 ${signal} received. Starting graceful shutdown...`);
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('❌ Could not close connections in time. Forcing shutdown...');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    } catch (error) {
        console.error('❌ Failed to start server:');
        if (error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }
};

startServer();
