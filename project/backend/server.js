import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { globalLimiter } from './middleware/rateLimit.js';
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import housingRoutes from "./routes/housingRoutes.js";
import commercialRoutes from "./routes/commercialRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import webhookRoutes from "./routes/webhook.js";
import planRoutes from "./routes/planRoutes.js";
import builderRoutes from "./routes/builderRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import "./subscriptionCron.js";

dotenv.config();

// --- FOOLPROOF: Environment Validation ---
const REQUIRED_ENV = [
  'MONGODB_URI',
  'JWT_ACCESS_TOKEN_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`\n❌ CRITICAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error("Please check your .env file before starting the server.\n");
  process.exit(1);
}

const app = express(); // Initialize Express app

// Apply global limiter to all routes
app.use(globalLimiter);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve frontend static files
const frontendPath = path.join(process.cwd(), "..", "frontend");
app.use(express.static(frontendPath));

app.get('/pricing', (req, res) => res.sendFile(path.join(frontendPath, 'pricing.html')));

// razorpay webhook route
app.use("/api/webhook", webhookRoutes);

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/housing', housingRoutes);
app.use('/api/commercial', commercialRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/builder", builderRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/properties", propertyRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Global error handler to ensure JSON response for all errors
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
