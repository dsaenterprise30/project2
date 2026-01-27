import dotenv from 'dotenv';
import mongoose from 'mongoose';
import housingProperty from './models/housingProperty.js';
import comercialProperty from './models/comercial.js';

dotenv.config();

async function verifyCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check housing collection
        console.log('=== HOUSING PROPERTIES ===');
        console.log(`Model name: housingProperty`);
        console.log(`Collection name: ${housingProperty.collection.name}`);
        const housingCount = await housingProperty.countDocuments();
        console.log(`Documents in collection: ${housingCount}`);

        if (housingCount > 0) {
            const sample = await housingProperty.findOne();
            console.log('Sample document:', JSON.stringify(sample, null, 2));
        }

        console.log('\n=== COMMERCIAL PROPERTIES ===');
        console.log(`Model name: comercialProperty`);
        console.log(`Collection name: ${comercialProperty.collection.name}`);
        const comercialCount = await comercialProperty.countDocuments();
        console.log(`Documents in collection: ${comercialCount}`);

        if (comercialCount > 0) {
            const sample = await comercialProperty.findOne();
            console.log('Sample document:', JSON.stringify(sample, null, 2));
        }

        console.log('\n✅ COLLECTION MAPPINGS VERIFIED!');
        console.log(`Housing API will use: ${housingProperty.collection.name}`);
        console.log(`Commercial API will use: ${comercialProperty.collection.name}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyCollections();
