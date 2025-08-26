import mongoose from "mongoose";

const connectionString = process.env.MONGODB_URL!; // we declare that MONGODB_URL is present

if (!connectionString) {
    throw new Error('Connection string is not defined');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { connection: null, promise: null }
}

export async function dbConnect() {
    if (cached.connection) return cached.connection; //connection already exist

    if (!cached.promise) {   // making new connection
        const options = {
            bufferCommands: true,
            maxPoolSize: 10
        }


        cached.promise = mongoose.connect(connectionString, options)
            .then(() => mongoose.connection)
    }

    try {
        cached.connection = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw new Error("Error in connecting database");
    }

    return cached.connection;
}

