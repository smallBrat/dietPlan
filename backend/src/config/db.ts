import mongoose from 'mongoose';
import { env } from './env';

/**
 * MongoDB Connection Configuration
 * Uses MongoDB Atlas with recommended mongoose settings
 */
export const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = env.MONGODB_URI;

        console.log('🔗 Connecting to MongoDB Atlas...');

        const conn = await mongoose.connect(mongoUri, {
            // Connection options
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Pool settings for production
            maxPoolSize: 10,
            minPoolSize: 5,
            // Automatic index creation
            autoIndex: true,
            // Time between connection retry attempts
            connectTimeoutMS: 10000,
        });

        console.log(`✅ MongoDB Connected`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.db?.databaseName}`);
        console.log(`   State: ${
            conn.connection.readyState === 1
                ? 'Connected'
                : conn.connection.readyState === 0
                  ? 'Disconnected'
                  : 'Unknown'
        }`);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed');

        if (error instanceof Error) {
            console.error(`   Error: ${error.message}`);

            if (error.message.includes('ECONNREFUSED')) {
                console.error('   → MongoDB server not running or unreachable');
            } else if (error.message.includes('authentication failed')) {
                console.error('   → Invalid credentials. Check MONGODB_URI in .env.local');
            } else if (error.message.includes('Invalid connection string')) {
                console.error('   → Invalid MongoDB URI format');
            }
        }

        // Exit process on connection failure
        console.error('🚨 Exiting application due to database connection failure');
        process.exit(1);
    }
};

/**
 * Monitor connection state
 */
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
    console.log('🔴 Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('reconnected', () => {
    console.log('🟡 Mongoose reconnected to MongoDB');
});
