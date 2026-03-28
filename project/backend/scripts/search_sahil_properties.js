import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const propertySchema = new mongoose.Schema({
    contact: String,
    builderName: String,
    ownerName: String,
    projectName: String,
    location: String
}, { strict: false });

const Housing = mongoose.model('Housing', propertySchema);
const Commercial = mongoose.model('Commercial', propertySchema);

async function findBySahil() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const housing = await Housing.find({ 
            $or: [
                { builderName: { $regex: /sahil/i } },
                { ownerName: { $regex: /sahil/i } },
                { contact: { $regex: /7499455975/ } }
            ]
        });
        
        const commercial = await Commercial.find({ 
            $or: [
                { builderName: { $regex: /sahil/i } },
                { ownerName: { $regex: /sahil/i } },
                { contact: { $regex: /7499455975/ } }
            ]
        });
        
        console.log("SEARCH_RESULTS_START");
        console.log(JSON.stringify({ housing, commercial }, null, 2));
        console.log("SEARCH_RESULTS_END");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findBySahil();
