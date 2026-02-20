import express from "express";
import {
    createComercialListing,
    getAllComercialListings,
    updateComercialListingById,
    deleteComercialListingById,
    sendInterestSMS
} from "../controllers/comercialController.js";

// Comment out or remove these imports for now
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

// Allow any authenticated builder/user to create a commercial listing.
// `checkAdminNumber` was blocking non-admin builders from adding properties.
router.post("/create", verifyAccessToken, createComercialListing);
// route 1: create comercial listing
router.get("/all", verifyAccessToken, checkAdminNumber, getAllComercialListings);
// route 2: get all comercial listings
// Allow authenticated users to update listings (ownership checks happen in controller if needed).
router.put("/update/:id", verifyAccessToken, updateComercialListingById);
// route 3: update a single comercial listing by ID
// Allow authenticated users to delete listings (ownership checks happen in controller if needed).
router.delete("/delete/:id", verifyAccessToken, deleteComercialListingById);
// route 4: delete a single comercial listing by ID

//Route 5: fetch all comercial listings for public access
router.get("/all-public", verifyAccessToken, getAllComercialListings);

router.post("/send-interest", verifyAccessToken, sendInterestSMS);

export default router;