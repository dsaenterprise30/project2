import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ContactClick from './models/ContactClick.js';
import RentFlat from './models/rentflats.js';
import SellFlat from './models/sellflats.js';

dotenv.config();

const debugAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Fetch last 10 clicks
        const clicks = await ContactClick.find().sort({ clickedAt: -1 }).limit(10);

        console.log(`Found ${clicks.length} recent clicks:`);

        for (const click of clicks) {
            console.log("\n---------------------------------------------------");
            console.log(`Click ID: ${click._id}`);
            console.log(`Property ID stored: '${click.propertyId}'`);
            console.log(`Property Type: ${click.propertyType}`);
            console.log(`Clicked At: ${click.clickedAt}`);
            console.log(`User: ${click.userId}`);

            if (click.propertyId && click.propertyId !== 'unknown') {
                let property = null;
                try {
                    if (click.propertyType === 'rent') {
                        property = await RentFlat.findById(click.propertyId);
                    } else if (click.propertyType === 'sell') {
                        property = await SellFlat.findById(click.propertyId);
                    }
                } catch (err) {
                    console.log(`ERROR looking up property: ${err.message}`);
                }

                if (property) {
                    console.log(`✅ MATCH FOUND!`);
                    console.log(`   Location: ${property.location}`);
                    console.log(`   Price: ${property.price}`);
                    console.log(`   Type: ${property.propertyType}`);
                } else {
                    console.log(`❌ NO MATCH FOUND for ID '${click.propertyId}' in ${click.propertyType} collection.`);
                }
            } else {
                console.log(`⚠️ Invalid Property ID: '${click.propertyId}'`);
            }
        }

    } catch (error) {
        console.error("FATAL ERROR:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugAnalytics();
