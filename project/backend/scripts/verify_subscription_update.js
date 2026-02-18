import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Builder from '../models/Builder.js';
import SubscriptionPlan from '../models/subscriptionPlan.js';
import { updateSubscription } from '../controllers/subscriptionController.js';
import Housing from '../models/Housing.js';
import Commercial from '../models/Commercial.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create a dummy Builder
        const builder = new Builder({
            fullName: 'Test Builder',
            mobileNumber: '9999999999',
            password: 'password123',
            companyName: 'Test Company',
            email: 'test@example.com',
            city: 'Test City',
            subscriptionStatus: 'active',
            type: 'Builder',
            isActive: true,
            subscription: {
                status: 'active'
            }
        });

        await builder.save();
        console.log('Created dummy Builder:', builder._id);

        // Create dummy Properties linked to Builder
        const housing = new Housing({
            builderId: builder._id,
            title: 'Test Housing',
            active: true
        });
        // Note: Housing schema might have required fields, skipping full check for brevity, assuming updateMany won't fail if documents don't exist or just updates 0.
        // Actually, updateMany just runs. If I want to verify property updates, I should insert one.
        // Let's create a minimal Housing property if possible, but schema validation might be strict.
        // I'll skip creating properties to keep it simple, checking builder update is the main goal. 
        // updateMany will return { acknowledged: true, modifiedCount: 0 } which is fine.

        // Create a dummy Plan
        // Check if plan exists first to avoid duplicate key error if previous run failed cleanup
        await SubscriptionPlan.findOneAndDelete({ plan: 'test_plan' });

        const plan = new SubscriptionPlan({
            plan: 'test_plan',
            price: 100,
            priorityLevel: 5,
            durationInDays: 30,
            description: 'Test Plan',
            features: ['Feature 1'],
            isActive: true
        });

        await plan.save();
        console.log('Created dummy Plan:', plan.plan);

        // Mock req and res
        const req = {
            body: {
                builderId: builder._id,
                plan: 'test_plan'
            }
        };

        const res = {
            json: (data) => {
                console.log('Response:', data);
            },
            status: (code) => {
                console.log('Status:', code);
                return { json: (data) => console.log('Error Response:', data) };
            }
        };

        // Call updateSubscription
        console.log('Calling updateSubscription...');
        await updateSubscription(req, res);

        // Verify Builder
        const updatedBuilder = await Builder.findById(builder._id);
        console.log('Updated Builder Plan:', updatedBuilder.subscription.planName);
        console.log('Updated Builder Priority:', updatedBuilder.subscription.priorityScore);

        if (updatedBuilder.subscription.planName === 'test_plan' && updatedBuilder.subscription.priorityScore === 5) {
            console.log('VERIFICATION PASSED');
        } else {
            console.error('VERIFICATION FAILED');
        }

        // Cleanup
        await Builder.findByIdAndDelete(builder._id);
        await SubscriptionPlan.findOneAndDelete({ plan: 'test_plan' });
        console.log('Cleanup complete');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
