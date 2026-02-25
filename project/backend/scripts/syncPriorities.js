import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Builder from '../models/Builder.js';
import Housing from '../models/Housing.js';
import Commercial from '../models/Commercial.js';

dotenv.config();

const syncPriorities = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const builders = await Builder.find().lean();
        console.log(`Found ${builders.length} builders.`);

        for (const builder of builders) {
            const priority = builder.subscription ? builder.subscription.priorityScore : 0;
            const plan = builder.subscription ? builder.subscription.planName : "free";

            console.log(`Updating properties for builder: ${builder.fullName} (Plan: ${plan}, Priority: ${priority})`);

            // Update Housing
            const housingResult = await Housing.updateMany(
                {
                    $or: [
                        { contact: builder.mobileNumber },
                        { contact: '91' + builder.mobileNumber },
                        { contact: builder.mobileNumber.replace(/^91/, '') }
                    ]
                },
                {
                    $set: {
                        builderId: builder._id,
                        builderPlan: plan,
                        builderPriority: priority
                    }
                }
            );
            console.log(`  Housing: Matched ${housingResult.matchedCount}, Updated ${housingResult.modifiedCount}`);

            // Update Commercial
            const commercialResult = await Commercial.updateMany(
                {
                    $or: [
                        { contact: builder.mobileNumber },
                        { contact: '91' + builder.mobileNumber },
                        { contact: builder.mobileNumber.replace(/^91/, '') }
                    ]
                },
                {
                    $set: {
                        builderId: builder._id,
                        builderPlan: plan,
                        builderPriority: priority
                    }
                }
            );
            console.log(`  Commercial: Matched ${commercialResult.matchedCount}, Updated ${commercialResult.modifiedCount}`);
        }

        console.log("Sync completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error syncing priorities:", error);
        process.exit(1);
    }
};

syncPriorities();
