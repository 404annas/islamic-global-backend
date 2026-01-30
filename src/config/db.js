
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`\x1b[32m✔ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    } catch (error) {
        console.error(`\x1b[31m✘ MongoDB Connection Error: ${error.message}\x1b[0m`);
        throw error;
    }
};

export default connectDB;
