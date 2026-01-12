import express from "express";
import { getClickAnalytics, getUserInterests } from "../controllers/analyticsController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

// Get all click analytics (Admin Only)
router.get("/all-clicks", verifyAccessToken, checkAdminNumber, getClickAnalytics);

// Get specific user's inbound leads (Admin Only)
router.get("/user/:userId", verifyAccessToken, checkAdminNumber, getUserInterests);

export default router;
