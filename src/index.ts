import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { getPool } from '../db/config';
import bugRoutes from './routes/bug.routes';
import commentRoutes from './routes/comments.routes';
import projectRoutes from './routes/projects.routes';
import userRoutes from './routes/user.routes';

const  app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;


// Routes
bugRoutes(app);
commentRoutes(app);
projectRoutes(app);
userRoutes(app);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: "Bug Tracker API is running",
        version: "1.0.0",
        endpoints: {
            bugs: "/api/bugs",
            comments: "/api/comments",
            projects: "/api/projects",
            users: "/api/users"
        }
    });
});

// Initialize database connection for both production and tests
let dbPool: any = null;
let isInitialized = false;

const initializeDatabase = async () => {
    if (!isInitialized) {
        try {
            dbPool = await getPool();
            isInitialized = true;
            if (process.env.NODE_ENV !== 'test') {
                console.log("Database connected Successfully");
            }
        } catch (error) {
            console.error("Database connection error:", error);
            throw error;
        }
    }
    return dbPool;
};

// For tests, initialize database connection immediately
if (process.env.NODE_ENV === 'test') {
    initializeDatabase().catch(err => {
        console.error('Failed to initialize database for tests:', err);
        process.exit(1);
    });
}

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        console.log("Starting server...");
        try {
            await initializeDatabase();
            console.log(`Server is running on http://localhost:${PORT}`);
        } catch (error) {
            console.log("Error starting the server", error);
        }
    });
}
