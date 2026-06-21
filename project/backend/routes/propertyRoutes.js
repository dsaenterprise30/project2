import express from "express";
import { getUniqueLocations, addCity, deleteCity, bulkImportProperties } from "../controllers/propertyController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

// Public route to get unique locations for search dropdowns
router.get("/locations", verifyAccessToken, getUniqueLocations);

// Admin route to add a new city
router.post("/add-city", verifyAccessToken, addCity);

// Admin route to delete a city
router.delete("/delete-city/:name", verifyAccessToken, deleteCity);


// Admin route to bulk import properties from excel sheet
router.post("/bulk-import", verifyAccessToken, checkAdminNumber, bulkImportProperties);

export default router;

