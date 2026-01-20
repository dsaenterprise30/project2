import express from "express";
import {
    registerBroker,
    loginBroker,
    getAllBrokers, 
    getBrokerById  
} from "../controllers/brokerController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";

const router = express.Router();

//Routes 1: Broker Registration
router.post("/register", registerBroker);

//Routes 2: Broker Login
router.post("/login", loginBroker);

//Routes 3: Get All Brokers (Admin Only)
router.get("/all", verifyAccessToken, checkAdminNumber, getAllBrokers);

//Route 4: Get Broker by id
router.get("/:id", verifyAccessToken, getBrokerById);

export default router;