import mongoose from "mongoose";

const BuilderSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  companyName: String,
  email: {
    type: String
  },
  city: String,
  subscriptionStatus: String,
  planExpiryDate: Date,
  subscriptionExpiry: Date,
  registrationDate: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['Builder', 'User'],
    default: 'Builder'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan.js"
    },
    planName: {
      type: String,
      default: "free",

    },
    priorityScore: {
      type: Number,
      default: 0   // 🔥 used for sorting
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active"
    }
  }
}, { timestamps: true });

const Builder = mongoose.model('Builder', BuilderSchema);
export default Builder;
