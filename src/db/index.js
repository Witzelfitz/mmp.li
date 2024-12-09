import mongoose from 'mongoose';
import config from '../config.js';

const connectDB = async () => {
    try {
        const dbUser = config.dbUser; // Username from config
        const dbPassword = config.dbPassword; // Password from config

        // Construct the MongoDB URI
        const uri = `mongodb://${dbUser}:${dbPassword}@127.0.0.1:27017/mmpli?authSource=admin`;
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
};

export { connectDB };

