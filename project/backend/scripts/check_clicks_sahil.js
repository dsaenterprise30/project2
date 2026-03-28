import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkClicks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const ContactClick = mongoose.connection.db.collection('contactclicks');
        
        // Find clicks for Sahil's contact 7499455975
        const clicks = await ContactClick.find({ 
            ownerContact: { $regex: /7499455975/ } 
        }).sort({ clickedAt: -1 }).limit(5).toArray();
        
        console.log("CLICKS_FOUND_START");
        console.log(JSON.stringify(clicks, null, 2));
        console.log("CLICKS_FOUND_END");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkClicks();
