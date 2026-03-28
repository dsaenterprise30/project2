import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const Housing = mongoose.model('Housing', new mongoose.Schema({
    contact: String,
    location: String,
    price: Number,
    propertyType: String,
    projectName: String,
    builderName: String
}));

const Commercial = mongoose.model('Commercial', new mongoose.Schema({
    contact: String,
    location: String,
    price: Number,
    propertyType: String,
    projectName: String,
    builderName: String
}));

async function findProperties() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const contactToFind = '7499455975';
        
        const housing = await Housing.find({ 
            contact: { $regex: contactToFind } 
        });
        
        const commercial = await Commercial.find({ 
            contact: { $regex: contactToFind } 
        });
        
        console.log("PROPERTIES_FOUND_START");
        console.log(JSON.stringify({ housing, commercial }, null, 2));
        console.log("PROPERTIES_FOUND_END");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findProperties();
