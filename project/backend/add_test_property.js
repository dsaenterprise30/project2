import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Commercial from './models/Commercial.js';

dotenv.config();

async function addProperty() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testProperty = {
            location: 'Andheri West, Mumbai',
            area: '1200 sq ft',
            propertyType: 'Office',
            commercialType: 'IT Park',
            price: 50000000, 
            carpetArea: '1000 sq ft',
            projectName: 'Sahil Heights',
            builderName: 'Sahil',
            contact: '7499455975', 
            builderPriority: 10,
            builderPlan: 'premium',
            date: new Date(),
            possessionDate: new Date('2026-12-31'),
            builderId: new mongoose.Types.ObjectId("69c61965bd27170b76257be1")
        };

        const newListing = new Commercial(testProperty);
        const savedListing = await newListing.save();
        console.log('Successfully saved property:', savedListing._id);

    } catch (error) {
        console.error('Error adding property:', error);
    } finally {
        await mongoose.disconnect();
    }
}

addProperty();
