import {
    registerBuilder,
    loginBuilder,
    getAllBuilders,
    updateBuilderById,
    deleteBuilderById,
    validateBuilderByContact
} from "../controllers/builderController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";
import express from "express";

const router = express.Router();

router.post("/register", registerBuilder);
//Route 1: Builder Registration

router.post("/create", registerBuilder);
//Route 1b: Builder Registration (alias for /register to match frontend)

// Route 6: Validate builder by contact number (admin-only)
router.post("/validate", verifyAccessToken, checkAdminNumber, validateBuilderByContact);

router.post("/login", loginBuilder);
//Route 2: Builder Login

router.put("/update/:id", verifyAccessToken, checkAdminNumber, updateBuilderById);
//Route 3: Update Builder by ID

router.delete("/delete/:id", verifyAccessToken, checkAdminNumber, deleteBuilderById);
//Route 4: Delete Builder by ID

router.get("/all", verifyAccessToken, checkAdminNumber, getAllBuilders);
//Route 5: Get All Builders (Admin Only)


export default router;
