import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function findInCorrectCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const housingCol = mongoose.connection.db.collection('housingproperties');
        const commercialCol = mongoose.connection.db.collection('commercialproperties');
        const comercialMisspelledCol = mongoose.connection.db.collection('comercialproperties');
        
        const contactToFind = '7499455975';
        
        const h = await housingCol.find({ 
            $or: [
                { builderName: { $regex: /sahil/i } },
                { contact: { $regex: contactToFind } }
            ]
        }).toArray();
        
        const c = await commercialCol.find({ 
            $or: [
                { builderName: { $regex: /sahil/i } },
                { contact: { $regex: contactToFind } }
            ]
        }).toArray();

        const cm = await comercialMisspelledCol.find({ 
            $or: [
                { builderName: { $regex: /sahil/i } },
                { contact: { $regex: contactToFind } }
            ]
        }).toArray();
        
        console.log("SEARCH_RESULTS_START");
        console.log(JSON.stringify({ housing: h, commercial: c, commercial_misspelled: cm }, null, 2));
        console.log("SEARCH_RESULTS_END");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findInCorrectCollections();
