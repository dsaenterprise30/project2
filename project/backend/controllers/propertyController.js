import Housing from "../models/Housing.js";
import Commercial from "../models/Commercial.js";
import City from "../models/City.js";
import Builder from "../models/Builder.js";

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

// Route: Delete a city from the City collection
export const deleteCity = async (req, res) => {
    const { name } = req.params;

    if (!name || name.trim() === "") {
        return res.status(400).json({ success: false, message: "City name is required." });
    }

    try {
        const deletedCity = await City.findOneAndDelete({ name: name.trim() });
        if (!deletedCity) {
            return res.status(404).json({ success: false, message: "City not found." });
        }

        res.status(200).json({
            success: true,
            message: "City deleted successfully.",
            city: deletedCity
        });
    } catch (error) {
        console.error("Error deleting city:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while deleting city."
        });
    }
};


// Helper function to parse price string with lakhs and crores
const parseBulkPrice = (priceVal) => {
    if (typeof priceVal === 'number') return priceVal;
    if (typeof priceVal !== 'string') return 0;
    
    const lowerStr = priceVal.toLowerCase();
    const cleanStr = lowerStr.replace(/,/g, '').trim();
    
    const match = cleanStr.match(/[0-9.]+/);
    if (!match) return 0;
    
    let num = parseFloat(match[0]);
    
    if (cleanStr.includes('cr') || cleanStr.includes('crore')) {
        num = num * 10000000;
    } else if (cleanStr.includes('lakh') || cleanStr.includes('lac') || cleanStr.includes('lk')) {
        num = num * 100000;
    }
    
    return num;
};

// Helper function to clean the mobile number
const cleanMobile = (mobileVal) => {
    if (!mobileVal) return '';
    return String(mobileVal).replace(/\D/g, '');
};

// Route: Bulk Import Properties from Excel (Admin Only)
export const bulkImportProperties = async (req, res) => {
    const { type, properties } = req.body || {};

    if (!type || !['housing', 'commercial'].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid type. Must be 'housing' or 'commercial'." });
    }

    if (!properties || !Array.isArray(properties) || properties.length === 0) {
        return res.status(400).json({ success: false, message: "No properties provided for import." });
    }

    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const results = [];

    for (let i = 0; i < properties.length; i++) {
        const prop = properties[i];
        const rowNum = i + 2; // Assuming row 1 is headers

        try {
            const contactRaw = prop.contact;
            const sanitizedContact = cleanMobile(contactRaw);
            const projectName = prop.projectName ? String(prop.projectName).trim() : '';
            const location = prop.location ? String(prop.location).trim() : '';
            const propertyType = prop.propertyType ? String(prop.propertyType).trim() : '';
            const carpetArea = prop.carpetArea ? String(prop.carpetArea).trim() : '';
            const area = prop.area ? String(prop.area).trim() : '';
            const price = prop.price;

            // 1. Validation checks
            if (!projectName || !sanitizedContact || !location || !propertyType || !carpetArea || price === undefined || price === '') {
                failedCount++;
                results.push({
                    row: rowNum,
                    status: 'failed',
                    projectName: projectName || 'Unknown',
                    message: `Missing required fields: ${[!projectName && 'Project Name', !sanitizedContact && 'Contact', !location && 'Location', !propertyType && 'Property Type', !carpetArea && 'Carpet Area', (price === undefined || price === '') && 'Price'].filter(Boolean).join(', ')}`
                });
                continue;
            }

            // 2. Find registered Builder by contact
            const builder = await Builder.findOne({
                $or: [
                    { mobileNumber: sanitizedContact },
                    { mobileNumber: '91' + sanitizedContact },
                    { mobileNumber: '+' + sanitizedContact },
                    { mobileNumber: '+91' + sanitizedContact },
                    { mobileNumber: sanitizedContact.replace(/^91/, '') },
                    { mobileNumber: '+' + sanitizedContact.replace(/^91/, '') },
                    { mobileNumber: '+91' + sanitizedContact.replace(/^91/, '') }
                ]
            });

            if (!builder) {
                failedCount++;
                results.push({
                    row: rowNum,
                    status: 'failed',
                    projectName,
                    message: `Builder contact '${contactRaw}' is not registered. Please register this builder first.`
                });
                continue;
            }

            const parsedPrice = parseBulkPrice(price);

            // 3. Check for duplicates
            let duplicate = null;
            if (type === 'housing') {
                duplicate = await Housing.findOne({
                    contact: '91' + sanitizedContact,
                    location,
                    area,
                    propertyType,
                    price: parsedPrice,
                    projectName
                });
            } else {
                duplicate = await Commercial.findOne({
                    contact: sanitizedContact,
                    location,
                    area,
                    propertyType,
                    price: parsedPrice,
                    projectName
                });
            }

            if (duplicate) {
                skippedCount++;
                results.push({
                    row: rowNum,
                    status: 'skipped',
                    projectName,
                    message: `Duplicate listing already exists.`
                });
                continue;
            }

            // 4. Create and save new listing
            if (type === 'housing') {
                const newListing = new Housing({
                    location,
                    area,
                    propertyType,
                    price: parsedPrice,
                    contact: '91' + sanitizedContact,
                    builderName: prop.builderName || builder.fullName,
                    projectName,
                    date: prop.date || new Date(),
                    carpetArea,
                    carParking: prop.carParking || '',
                    builderId: builder._id,
                    builderPlan: builder.subscription ? builder.subscription.planName : "free",
                    builderPriority: builder.subscription ? builder.subscription.priorityScore : 0,
                    possessionDate: prop.possessionDate ? new Date(prop.possessionDate) : null
                });
                await newListing.save();
            } else {
                const newListing = new Commercial({
                    location,
                    area,
                    carpetArea,
                    propertyType,
                    price: parsedPrice,
                    date: prop.date || new Date(),
                    contact: sanitizedContact,
                    projectName,
                    builderName: prop.builderName || builder.fullName,
                    builderId: builder._id,
                    builderPlan: builder.subscription ? builder.subscription.planName : "free",
                    builderPriority: builder.subscription ? builder.subscription.priorityScore : 0,
                    possessionDate: prop.possessionDate ? new Date(prop.possessionDate) : null,
                    commercialType: prop.commercialType || ''
                });
                await newListing.save();
            }

            successCount++;
            results.push({
                row: rowNum,
                status: 'success',
                projectName,
                message: 'Property imported successfully.'
            });

        } catch (error) {
            console.error(`Error importing row ${rowNum}:`, error);
            failedCount++;
            results.push({
                row: rowNum,
                status: 'failed',
                projectName: prop.projectName || 'Unknown',
                message: `Server error: ${error.message}`
            });
        }
    }

    res.status(200).json({
        success: true,
        summary: {
            total: properties.length,
            imported: successCount,
            skipped: skippedCount,
            failed: failedCount
        },
        results
    });
};

