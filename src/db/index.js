import mongoose from 'mongoose';
import config from '../config.js';

// const connectDB = async () => {
//     try {
//         await mongoose.connect('mongodb://localhost/mmpli');
//         console.log('MongoDB connected');
//     } catch (error) {
//         console.error('Could not connect to MongoDB', error);
//         process.exit(1);
//     }
// };

const connectDB = async () => {
    try {
        const dbUser = config.dbUser; // Username from config
        const dbPassword = config.dbPassword; // Password from config
        const dbHost = config.dbHost; // MongoDB server host from config
        const dbName = config.dbName; // Database name from config

        // Construct the MongoDB URI
        const uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}/${dbName}?authSource=admin`;
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
};

export { connectDB };
