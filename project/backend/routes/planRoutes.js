import express from "express";
import SubscriptionPlan from "../models/subscriptionPlan.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priorityLevel: -1 });
    return res.json(plans);
  } catch (err) {
    console.error("Failed to fetch plans:", err);
    return res.status(500).json({ message: "Server error fetching plans" });
  }
});

// router.post("/seed-plans", async (req, res) => {
//   try {
//     const plans = [
//       {
//         plan: "platinum",
//         price: 2999,
//         priorityLevel: 3,
//         durationInDays: 30,
//         description: "Premium visibility and top priority",
//         features: ["Top Query Priority", "Unlimited Leads", "Premium Support"]
//       },
//       {
//         plan: "gold",
//         price: 1999,
//         priorityLevel: 2,
//         durationInDays: 30,
//         description: "Standard plan for active builders",
//         features: ["High Priority", "50 Leads", "Email Support"]
//       },
//       {
//         plan: "silver",
//         price: 999,
//         priorityLevel: 1,
//         durationInDays: 30,
//         description: "Basic plan for starters",
//         features: ["Standard Priority", "20 Leads"]
//       },
//       {
//         plan: "free",
//         price: 0,
//         priorityLevel: 0,
//         durationInDays: 365, // effectively unlimited or long duration
//         description: "Free tier with limited features",
//         features: ["Basic Listing", "Limited Visibility"],
//         isActive: true
//       }
//     ];

//     // Use updateOne with upsert to avoid duplicates
//     for (const planData of plans) {
//       await SubscriptionPlan.updateOne(
//         { plan: planData.plan },
//         { $set: planData },
//         { upsert: true }
//       );
//     }

//     res.json({ message: "Plans inserted/updated successfully" });
//   } catch (error) {
//     console.error("Seed error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

import { createSubscriptionOrder, verifyPayment } from "../controllers/subscriptionController.js";

// Payment Routes
router.post("/create-order", createSubscriptionOrder);
router.post("/verify-payment", verifyPayment);

export default router;