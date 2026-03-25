import express from "express";
import { verifyPayment, createSubscriptionOrder, updateSubscription, getAllPlans } from "../controllers/subscriptionController.js";
import { verifyAccessToken } from "../middleware/userAuth.js";
import { checkAdminNumber } from "../middleware/checkAdminNumber.js";
import checkSubscription from "../middleware/checkSubscription.js";

const router = express.Router();

//Route 1: To verify the payment.
router.post("/verifyPayment", verifyPayment);

//Route 2: To create the subscription order.
router.post("/create-subscription-order", verifyAccessToken, checkAdminNumber, createSubscriptionOrder);

//Route 3: To update subscription manually/directly
router.put("/:id/subscriptions", verifyAccessToken, checkAdminNumber, updateSubscription);

//Route 4: To get all subscription plans
router.get("/subscriptionPlans", getAllPlans); 

export default router;