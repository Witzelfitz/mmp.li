import mongoose from 'mongoose';
import config from '../config.js';

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
};

export { connectDB };
