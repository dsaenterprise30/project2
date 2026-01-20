import {
    registerBuilder,
    loginBuilder,
    updateBuilderById,
    deleteBuilderById
} from "../controllers/builderController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";
import express from "express";

const router = express.Router();

router.post("/register", registerBuilder);
//Route 1: Builder Registration

router.post("/login", loginBuilder);
//Route 2: Builder Login

router.put("/update/:id", verifyAccessToken, checkAdminNumber, updateBuilderById);
//Route 3: Update Builder by ID

router.delete("/delete/:id", verifyAccessToken, checkAdminNumber, deleteBuilderById);
//Route 4: Delete Builder by ID

export default router;
