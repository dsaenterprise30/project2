import express from "express";
import {
    createCommercialListing,
    getAllCommercialListings,
    updateCommercialListingById,
    deleteCommercialListingById,
    sendInterestSMS
} from "../controllers/commercialController.js";

// Comment out or remove these imports for now
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

// Allow any authenticated builder/user to create a commercial listing.
// `checkAdminNumber` was blocking non-admin builders from adding properties.
router.post("/create", verifyAccessToken, createCommercialListing);
// route 1: create commercial listing
router.get("/all", verifyAccessToken, checkAdminNumber, getAllCommercialListings);
// route 2: get all commercial listings
// Allow authenticated users to update listings (ownership checks happen in controller if needed).
router.put("/update/:id", verifyAccessToken, updateCommercialListingById);
// route 3: update a single commercial listing by ID
// Allow authenticated users to delete listings (ownership checks happen in controller if needed).
router.delete("/delete/:id", verifyAccessToken, deleteCommercialListingById);
// route 4: delete a single commercial listing by ID

//Route 5: fetch all commercial listings for public access
router.get("/all-public", verifyAccessToken, getAllCommercialListings);

router.post("/send-interest", verifyAccessToken, sendInterestSMS);

export default router;