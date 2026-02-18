import express from "express";
import { verifyPayment, createSubscriptionOrder, updateSubscription } from "../controllers/subscriptionController.js";

const router = express.Router();

//Route 1: To verify the payment.
router.post("/verifyPayment", verifyPayment);

//Route 2: To create the subscription order.
router.post("/create-subscription-order", createSubscriptionOrder);

//Route 3: To update subscription manually/directly
router.put("/:id/subscriptions", updateSubscription);

export default router;