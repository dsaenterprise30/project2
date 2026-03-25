import express from "express";
import razorpay from "../config/razorpay.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import subscriptionPlan from "../models/subscriptionPlan.js";
import crypto from "crypto";
import Builder from "../models/Builder.js";
import Housing from "../models/Housing.js";
import Commercial from "../models/Commercial.js";

dotenv.config();

const router = express.Router();

const planPriorityMap = {
  platinum: 3,
  gold: 2,
  silver: 1
};

//Route 1 : Verify the paymemt and update the mongo DB.
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    builderId,
    plan
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  console.log(`[DEBUG] verifyPayment: Received verification request for builderId: ${builderId}, plan: ${plan}`);
  if (expectedSignature !== razorpay_signature) {
    console.warn(`[DEBUG] verifyPayment: Signature mismatch for order: ${razorpay_order_id}`);
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    // Fetch plan details to get priority
    const planDetails = await subscriptionPlan.findOne({ plan: plan });
    const priority = planDetails ? planDetails.priorityLevel : (planPriorityMap[plan] || 0);

    // 1️⃣ Set subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // 2️⃣ Update Builder
    await Builder.findByIdAndUpdate(builderId, {
      subscription: {
        planName: plan,
        priorityScore: priority,
        startDate,
        endDate,
        status: "active"
      }
    });

    // 3️⃣ Update Properties
    await Housing.updateMany(
      { builderId },
      {
        $set: {
          builderPlan: plan,
          builderPriority: priority
        }
      }
    );
    await Commercial.updateMany(
      { builderId },
      {
        $set: {
          builderPlan: plan,
          builderPriority: priority
        }
      }
    );

    res.json({ message: "Subscription activated successfully" });
  } catch (error) {
    console.error("Error activating subscription:", error);
    res.status(500).json({ message: "Error activating subscription" });
  }
};


// Route 2 : to create a new subscription
export const createSubscriptionOrder = async (req, res) => {
  const { builderId, plan } = req.body;
  console.log(`[DEBUG] createSubscriptionOrder: builderId=${builderId}, plan=${plan}`);

  try {
    const planDetails = await subscriptionPlan.findOne({ plan: plan });

    if (!planDetails) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const options = {
      amount: planDetails.price * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        builderId: builderId,
        plan: plan
      }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating Razorpay order: " + error.message });
  }
};

// Route 3: Update Subscription (Directly, e.g. from Admin or specific flow)
export const updateSubscription = async (req, res) => {
  const { builderId, plan, planName } = req.body;
  const id = req.params.id || builderId; // accurate ID from params
  const selectedPlan = plan || planName;

  try {
    const planDetails = await subscriptionPlan.findOne({ plan: selectedPlan });

    if (!planDetails) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.durationInDays);

    // Update Builder
    await Builder.findByIdAndUpdate(id, {
      subscription: {
        planName: selectedPlan,
        priorityScore: planDetails.priorityLevel,
        startDate,
        endDate,
        status: "active"
      }
    });

    // Update Properties
    await Housing.updateMany(
      { builderId: id },
      {
        $set: {
          builderPlan: selectedPlan,
          builderPriority: planDetails.priorityLevel
        }
      }
    );
    await Commercial.updateMany(
      { builderId: id },
      {
        $set: {
          builderPlan: selectedPlan,
          builderPriority: planDetails.priorityLevel
        }
      }
    );

    res.json({ message: "Subscription updated successfully", plan: planDetails });

  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Route 4: To get all subscription plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await subscriptionPlan.find({ isActive: true }).sort({ priorityLevel: -1 });
    return res.json(plans);
  } catch (err) {
    console.error("Failed to fetch plans:", err);
    return res.status(500).json({ message: "Server error fetching plans" });
  }
};

export default router;
