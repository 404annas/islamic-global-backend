
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`\x1b[36m🚀 Enterprise ESM Server running at http://localhost:${PORT}\x1b[0m`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed!", err);
    });
