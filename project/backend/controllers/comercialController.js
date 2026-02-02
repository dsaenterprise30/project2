import comercialProperty from "../models/Comercial.js";
import Builder from "../models/Builder.js";
import ContactClick from "../models/ContactClick.js";

// Helper function to sanitize and parse the price string
const parsePrice = (priceString) => {
    // Remove all non-numeric characters except the decimal point
    const numericString = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
};

// New helper function to clean the mobile number
const cleanMobileNumber = (mobileString) => {
    // This will remove any non-digit characters from the string
    return mobileString.replace(/\D/g, '');
};

// Route 1: Create a new comercial listing
export const createComercialListing = async (req, res) => {
    const { contact, area, location, propertyType, price, date, ownershipType, name, carpetArea, projectName } = req.body || {};

    try {
        if (!contact || !area || !location || !propertyType || !price || !date || !ownershipType || !name || !carpetArea) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        // Clean the mobile number (remove non-digits)
        const sanitizedContact = contact.replace(/\D/g, '');

        // ✅ BUILDER VALIDATION: Check if builder exists with this contact
        const builder = await Builder.findOne({
            $or: [
                { mobileNumber: sanitizedContact },
                { mobileNumber: '91' + sanitizedContact },
                { mobileNumber: sanitizedContact.replace(/^91/, '') }
            ]
        });

        if (!builder) {
            return res.status(403).json({
                success: false,
                message: "❌ Builder not found with this contact number. Only registered builders can add properties. Please register as a builder first."
            });
        }

        // Check for duplicate listing
        const duplicateListing = await comercialProperty.findOne({
            contact: sanitizedContact,
            location,
            area,
            propertyType,
            price: parsePrice(price),
            ownershipType
        });

        if (duplicateListing) {
            return res.status(409).json({
                message: "A listing with the same details already exists. Please modify at least one attribute."
            });
        }

        const newListing = new comercialProperty({
            location,
            area,
            carpetArea,
            propertyType,
            price: parsePrice(price),
            date,
            ownershipType,
            contact: sanitizedContact,
            projectName: projectName || '',
        });

        const savedListing = await newListing.save();

        res.status(201).json({
            message: "✅ New commercial property listed successfully.",
            listing: savedListing,
            builder: builder.fullName
        });

    } catch (error) {
        console.error("Error creating commercial listing:", error.message);

        if (error.code === 11000 && error.keyPattern?.contact) {
            return res.status(409).json({ message: "❌ This contact number is already used in another commercial listing." });
        }

        res.status(500).json({ message: "Server error while creating commercial listing. " + error.message });
    }
};

// Route 2: Get all comercial listings
export const getAllComercialListings = async (req, res) => {
    try {
        const listings = await comercialProperty.find().lean();

        const formattedListings = listings.map(listing => {
            const formattedPrice = (typeof listing.price === 'number' && !isNaN(listing.price))
                ? `₹${new Intl.NumberFormat('en-IN').format(listing.price)}`
                : "Price on request";

            return {
                ...listing,
                id: listing._id.toString(),
                price: formattedPrice
            };
        });

        res.status(200).json({
            message: "All commercial properties listed below.",
            count: formattedListings.length,
            data: formattedListings,
            commercialFlatsList: formattedListings
        });
    } catch (error) {
        console.error("Error fetching commercial listings:", error.message);
        res.status(500).json({ message: "Server error while fetching listings." });
    }
};

// Route 3: Update a comercial listing by its ID
export const updateComercialListingById = async (req, res) => {
    const { id } = req.params;
    const { location, area, propertyType, price, name, contact, date, ownershipType } = req.body || {};

    try {
        const update = {
            location,
            area,
            propertyType,
            price: parsePrice(price),
            userName: name,
            contact: cleanMobileNumber(contact),
            date,
            ownershipType
        };

        const result = await comercialProperty.findByIdAndUpdate(id, { $set: update }, { new: true });

        if (result) {
            res.status(200).json({
                message: `Sell listing with ID ${id} updated successfully.`,
                updatedListing: result,
            });
        } else {
            res.status(404).json({ message: "No sell listing found for the given ID." });
        }
    } catch (error) {
        console.error("Error updating sell listing:", error.message);
        res.status(500).json({ message: "Server error while updating listing." });
    }
};

// Route 4: Delete a comercial listing by its ID
export const deleteComercialListingById = async (req, res) => {
    const { id } = req.params; // Get ID from URL parameter

    try {
        const result = await comercialProperty.findByIdAndDelete(id);

        if (result) {
            return res.status(200).json({
                message: `Deleted listing with ID ${id}.`,
            });
        } else {
            return res.status(404).json({ message: "No listing found for the given ID." });
        }
    } catch (error) {
        console.error("Error deleting listings:", error.message);
        res.status(500).json({ message: "Server error while deleting listings." });
    }
};