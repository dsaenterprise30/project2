import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const propertySchema = new mongoose.Schema({}, { strict: false });

const Housing = mongoose.model('Housing', propertySchema);
const Commercial = mongoose.model('Commercial', propertySchema);

async function findRecent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const housing = await Housing.find({}).sort({ createdAt: -1 }).limit(5);
        const commercial = await Commercial.find({}).sort({ createdAt: -1 }).limit(5);
        
        console.log("RECENT_PROPERTIES_START");
        console.log(JSON.stringify({ housing, commercial }, null, 2));
        console.log("RECENT_PROPERTIES_END");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findRecent();
