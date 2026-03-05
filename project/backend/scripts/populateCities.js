import mongoose from 'mongoose';
import dotenv from 'dotenv';
import City from '../models/City.js';
import Housing from '../models/Housing.js';
import Commercial from '../models/Commercial.js';

dotenv.config({ path: './.env' });

const initialCities = [
    "Mira Road East",
    "Mira Road West",
    "Dahisar West",
    "Borivali West",
    "Kandivali West",
    "Malad West",
    "Ram Mandir West",
    "Goregaon West",
    "Andheri West",
    "Vile Parle West"
];

async function populate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        // Fetch distinct locations from properties as well
        const [housingLocations, commercialLocations] = await Promise.all([
            Housing.distinct("location"),
            Commercial.distinct("location")
        ]);

        const allLocations = [...new Set([...initialCities, ...housingLocations, ...commercialLocations])]
            .filter(loc => loc && loc.trim() !== "");

        console.log(`Found ${allLocations.length} unique locations to populate.`);

        for (const cityName of allLocations) {
            // Capitalize each word for consistency
            const formattedName = cityName.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            try {
                await City.findOneAndUpdate(
                    { name: formattedName },
                    { name: formattedName },
                    { upsert: true, new: true }
                );
                console.log(`Saved/Updated city: ${formattedName}`);
            } catch (err) {
                console.error(`Error saving city ${formattedName}:`, err.message);
            }
        }

        console.log("Population complete!");
        process.exit(0);
    } catch (error) {
        console.error("Connection error:", error.message);
        process.exit(1);
    }
}

populate();
