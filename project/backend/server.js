import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import housingRoutes from "./routes/housingRoutes.js";
import comercialRoutes from "./routes/comercialRoutes.js";
//import adminRoutes from "./routes/adminRoutes.js"; 
//import { firebaseconfig } from "./controllers/firebase.js"; 
//import { verifyAccessToken } from "./middleware/userAuth.js"; 
//import { checkAdminNumber } from "./middleware/checkAdminNumber.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import webhookRoutes from "./routes/webhook.js";
import planRoutes from "./routes/planRoutes.js";
import builderRoutes from "./routes/builderRoutes.js";



dotenv.config();
const app = express(); // Initialize Express app

app.use(cors());

// Serve frontend static files (so /pricing.html is available)
const frontendPath = path.join(process.cwd(), "..", "frontend");
app.use(express.static(frontendPath));
app.get('/pricing', (req, res) => res.sendFile(path.join(frontendPath, 'pricing.html')));

// razorpay webhook route
app.use("/api/webhook", webhookRoutes);

app.use(express.json());
app.use(cookieParser());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/housing', housingRoutes);
app.use('/api/comercial', comercialRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/builder", builderRoutes);

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
