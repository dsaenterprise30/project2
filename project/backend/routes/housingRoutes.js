import express from "express";
import {
    createHousingListing,
    getAllHousingListings,
    updateHousingListingById,
    deleteHousingListingById
} from "../controllers/housingController.js";
import { sendInterestSMS } from "../controllers/housingController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

router.post("/create", verifyAccessToken, checkAdminNumber, createHousingListing);
// route 1: create Housing listing

router.get("/all", verifyAccessToken, getAllHousingListings);
// route 2: get all Housing listings (Admin)

router.put("/update/:id", verifyAccessToken, checkAdminNumber, updateHousingListingById);
// route 3: update a single Housing listing by ID (Admin)

router.delete("/delete/:id", verifyAccessToken, checkAdminNumber, deleteHousingListingById);
// route 4: delete a single Housing listing by ID (Admin)

// Route 5: fetch all rent listings for public access (Agents)
router.get("/all-public", verifyAccessToken, getAllHousingListings);

// Route 6: Send Interest SMS (Mock)
router.post("/send-interest", verifyAccessToken, sendInterestSMS);

export default router;