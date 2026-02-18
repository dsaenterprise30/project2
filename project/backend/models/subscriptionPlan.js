import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  plan: {
    type: String, // e.g., "platinum", "gold", "silver", "free"
    required: true,
    unique: true,
    default: "free"
  },
  price: {
    type: Number,
    required: true
  },
  priorityLevel: {
    type: Number,
    default: 0
  },
  durationInDays: {
    type: Number,
    default: 30
  },
  planId: String, // To link with Razorpay's plan if needed
  description: String,
  features: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("SubscriptionPlan", planSchema);