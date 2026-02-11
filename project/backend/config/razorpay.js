// backend/config/razorpay.js
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpay;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠️  Razorpay keys missing in .env. Using mock implementation. Payment features will fail or use mock data.");
  razorpay = {
    customers: {
      create: async (data) => ({ id: "cust_mock_123", ...data }),
      all: async () => ({ items: [] }),
    },
    subscriptions: {
      create: async () => ({ id: "sub_mock_123" }),
    },
    orders: {
      create: async () => ({ id: "order_mock_123" })
    }
  };
}

export default razorpay;
