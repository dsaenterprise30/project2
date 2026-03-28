import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function listCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("COLLECTIONS_START");
        console.log(collections.map(c => c.name));
        console.log("COLLECTIONS_END");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listCollections();
