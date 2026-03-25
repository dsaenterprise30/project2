import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubscriptionPlan from './models/subscriptionPlan.js';

dotenv.config();

async function listPlans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const plans = await SubscriptionPlan.find();
        console.log('\n--- Available Subscription Plans ---');
        console.log(JSON.stringify(plans, null, 2));

    } catch (error) {
        console.error('❌ Error listing plans:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listPlans();
