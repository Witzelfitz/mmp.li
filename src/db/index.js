import mongoose from 'mongoose';
import config from '../config.js';

const connectDB = async () => {
    try {
        const username = encodeURIComponent(config.dbUser || '');
        const password = encodeURIComponent(config.dbPassword || '');
        const credentials = username ? `${username}:${password}@` : '';
        const uri = `mongodb://${credentials}${config.dbHost}/${config.dbName}?authSource=admin`;
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        throw error;
    }
};

export { connectDB };
