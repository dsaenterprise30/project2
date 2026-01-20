import mongoose from "mongoose";

const BuilderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: String,
  email: {
    type: String,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  city: String,
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan"
    },
    planName: String,
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
