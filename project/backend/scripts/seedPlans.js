import mongoose from "mongoose";
import dotenv from "dotenv";
import SubscriptionPlan from "../models/subscriptionPlan.js";

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const plans = [
      {
        plan: "platinum",
        price: 2999,
        priorityLevel: 3,
        durationInDays: 30,
        description: "Premium visibility and top priority",
        features: ["Top Query Priority", "Unlimited Leads", "Premium Support"]
      },
      {
        plan: "gold",
        price: 1999,
        priorityLevel: 2,
        durationInDays: 30,
        description: "Standard plan for active builders",
        features: ["High Priority", "50 Leads", "Email Support"]
      },
      {
        plan: "silver",
        price: 999,
        priorityLevel: 1,
        durationInDays: 30,
        description: "Basic plan for starters",
        features: ["Standard Priority", "20 Leads"]
      },
      {
        plan: "free",
        price: 0,
        priorityLevel: 0,
        durationInDays: 365,
        description: "Free tier with limited features",
        features: ["Basic Listing", "Limited Visibility"],
        isActive: true
      }
    ];

    for (const planData of plans) {
      await SubscriptionPlan.updateOne(
        { plan: planData.plan },
        { $set: planData },
        { upsert: true }
      );
      console.log(`Processed plan: ${planData.plan}`);
    }

    console.log("All plans seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();
