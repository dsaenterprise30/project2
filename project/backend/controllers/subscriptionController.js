import express from "express";
import razorpay from "../config/razorpay.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import SubscriptionPlan from "../models/subscriptionPlan.js";
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

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  // 1️⃣ Set subscription dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  // 2️⃣ Update Builder
  await Builder.findByIdAndUpdate(builderId, {
    subscription: {
      plan,
      priority: planPriorityMap[plan],
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
        builderPriority: planPriorityMap[plan]
      }
    }
  );
    await Commercial.updateMany(
        { builderId },
        {
          $set: {
            builderPlan: plan,
            builderPriority: planPriorityMap[plan]
          }
        }
    );

  res.json({ message: "Subscription activated successfully" });
};


// Route 2 : to create a new subscriptionimport razorpay from "../config/razorpay.js"
export const createSubscriptionOrder = async (req, res) => {
  const { builderId, plan } = req.body;

  const planAmount = {
    platinum: 2999,
    gold: 1999,
    silver: 999
  };

  const order = await razorpay.orders.create({
    amount: planAmount[plan] * 100, // paise
    currency: "INR",
    receipt: `builder_${builderId}_${Date.now()}`,
    notes: {
      project: "real_estate_platform",
      builderId,
      plan
    }
  });

  res.json(order);
};



export default router;
