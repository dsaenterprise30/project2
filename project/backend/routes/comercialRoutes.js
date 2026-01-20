import express from "express";
import { 
    createComercialListing, 
    getAllComercialListings, 
    updateComercialListingById, 
    deleteComercialListingById 
} from "../controllers/comercialController.js";

// Comment out or remove these imports for now
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

router.post("/create", verifyAccessToken, checkAdminNumber, createComercialListing);
// route 1: create comercial listing

router.get("/all", verifyAccessToken, checkAdminNumber, getAllComercialListings);
// route 2: get all comercial listings

router.put("/update/:id", verifyAccessToken, checkAdminNumber, updateComercialListingById);
// route 3: update a single comercial listing by ID

router.delete("/delete/:id", verifyAccessToken, checkAdminNumber, deleteComercialListingById);
// route 4: delete a single comercial listing by ID

//Route 5: fetch all comercial listings for public access
router.get("/all-public", verifyAccessToken, getAllComercialListings);

export default router;