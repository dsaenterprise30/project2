import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropEmailIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const collection = db.collection('builders');

        // List current indexes
        console.log('📋 Current indexes on builders collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, index.key);
        });
        console.log('');

        // Drop the email unique index if it exists
        try {
            await collection.dropIndex('email_1');
            console.log('✅ Successfully dropped email_1 index\n');
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log('ℹ️  email_1 index not found (already dropped)\n');
            } else {
                throw error;
            }
        }

        // Show updated indexes
        console.log('📋 Updated indexes:');
        const updatedIndexes = await collection.indexes();
        updatedIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, index.key);
        });

        console.log('\n✅ Database updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

dropEmailIndex();
