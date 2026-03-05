import Housing from "../models/Housing.js";
import Commercial from "../models/Commercial.js";
import City from "../models/City.js";

// Route: Get all unique locations from the City collection
export const getUniqueLocations = async (req, res) => {
    try {
        // Fetch all cities from the City collection
        const cities = await City.find().sort({ name: 1 }).lean();

        const locations = cities.map(city => city.name);

        res.status(200).json({
            success: true,
            count: locations.length,
            locations: locations
        });
    } catch (error) {
        console.error("Error fetching unique locations:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while fetching locations."
        });
    }
};

// Route: Add a new city to the City collection
export const addCity = async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: "City name is required." });
    }

    try {
        // Format name: capitalize each word
        const formattedName = name.trim().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const existingCity = await City.findOne({ name: formattedName });
        if (existingCity) {
            return res.status(400).json({ success: false, message: "City already exists." });
        }

        const newCity = new City({ name: formattedName });
        await newCity.save();

        res.status(201).json({
            success: true,
            message: "City added successfully.",
            city: newCity
        });
    } catch (error) {
        console.error("Error adding city:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while adding city."
        });
    }
};
