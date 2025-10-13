import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";


import { connectDB } from "./lib/db.js";


const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true //allows frontend to send cookies
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

const frontendDistPath = path.join(__dirname, "..", "Frontend", "dist");

if(process.env.NODE_ENV === "production"){
    // Verify if the dist directory exists
    try {
        // Serve static files
        app.use(express.static(frontendDistPath));

        // Handle client-side routing
        app.get("*", (req, res) => {
            res.sendFile(path.join(frontendDistPath, "index.html"));
        });
    } catch (error) {
        console.error("Error serving static files:", error);
        app.get("*", (req, res) => {
            res.status(500).send("Error loading application. Please check build files.");
        });
    }
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});

