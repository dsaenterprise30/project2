import express from "express";
import { getUniqueLocations, addCity } from "../controllers/propertyController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";

const router = express.Router();

// Public route to get unique locations for search dropdowns
router.get("/locations", verifyAccessToken, getUniqueLocations);

// Admin route to add a new city
router.post("/add-city", verifyAccessToken, addCity);

export default router;
