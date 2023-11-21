const config = {
    dbHost: process.env.MONGODB_DB_HOST, // Hinzugefügt für die Datenbankverbindung
    dbUser: process.env.MONGO_DB_USER,
    dbPassword: process.env.MONGO_DB_PASSWORD,
    dbName: process.env.MONGO_DB_NAME,
    Port: process.env.PORT
};

export default config;


// export MONGODB_URI='mongodb://localhost/mmpli'