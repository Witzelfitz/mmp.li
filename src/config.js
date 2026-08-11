const config = {
    dbHost: process.env.MONGODB_DB_HOST || '127.0.0.1:27017',
    dbUser: process.env.MONGO_DB_USER,
    dbPassword: process.env.MONGO_DB_PASSWORD,
    dbName: process.env.MONGO_DB_NAME || 'mmpli',
    port: Number.parseInt(process.env.PORT || '3000', 10)
};

export default config;
