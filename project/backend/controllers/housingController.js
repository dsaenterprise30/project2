import Housing from "../models/Housing.js";
import User from "../models/User.js";
import Builder from "../models/Builder.js";
import ContactClick from "../models/ContactClick.js";

import { sendWhatsAppMessage } from "./whatsappController.js";

// Helper function to sanitize and parse the price string
const parsePrice = (priceString) => {
    if (typeof priceString !== 'string') return null;
    const numericString = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
};

// Helper function to clean the mobile number string
const cleanMobileNumber = (mobileString) => {
    if (typeof mobileString !== 'string') return '';
    return mobileString.replace(/\D/g, '');
};

// Route 1: Create a new housing listing
export const createHousingListing = async (req, res) => {
    const { contact, area, location, propertyType, price, builderName, date, projectName, carpetArea } = req.body || {};

    try {
        if (!contact || !location || !propertyType || !price || !projectName || !carpetArea) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        // Clean the mobile number
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
        const duplicateListing = await Housing.findOne({
            contact: '91' + sanitizedContact,
            location,
            area,
            propertyType,
            price: parsePrice(price),
            projectName
        });

        if (duplicateListing) {
            return res.status(409).json({
                message: "A listing with the same details already exists. Please modify at least one attribute."
            });
        }

        const newListing = new Housing({
            location,
            area,
            propertyType,
            price: parsePrice(price),
            contact: '91' + sanitizedContact,
            builderName: builderName || builder.fullName,
            projectName,
            date,
            carpetArea
        });

        const savedListing = await newListing.save();

        res.status(201).json({
            message: "✅ New housing property listed successfully.",
            listing: savedListing,
            builder: builder.fullName
        });

    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.contact) {
            return res.status(409).json({
                message: "This contact number is already associated with an existing listing. Please use a different number."
            });
        }
        console.error("Error creating housing listing:", error.message);
        res.status(500).json({ message: "Server error while creating housing listing." });
    }
};


// Route 2: Get all housing listings
export const getAllHousingListings = async (req, res) => {
    try {
        const listings = await Housing.find().lean();

        const formattedListings = await Promise.all(
            listings.map(async (listing) => {
                const formattedPrice = (typeof listing.price === 'number' && !isNaN(listing.price))
                    ? `₹${new Intl.NumberFormat('en-IN').format(listing.price)}`
                    : "N/A";

                // Format dates to MM/DD/YYYY
                let formattedDate = '';
                if (listing.date || listing.createdAt) {
                    const dateObj = new Date(listing.date || listing.createdAt);
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    formattedDate = `${month}/${day}/${year}`;
                }

                let formattedReraDate = '';
                if (listing.reraDate) {
                    const reraDateObj = new Date(listing.reraDate);
                    const month = String(reraDateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(reraDateObj.getDate()).padStart(2, '0');
                    const year = reraDateObj.getFullYear();
                    formattedReraDate = `${month}/${day}/${year}`;
                }

                // Find builder to get priorityScore
                let builderPriority = 0;
                if (listing.contact) {
                    const sanitizedContact = String(listing.contact).replace(/\D/g, '');
                    const builder = await Builder.findOne({
                        $or: [
                            { mobileNumber: sanitizedContact },
                            { mobileNumber: '91' + sanitizedContact },
                            { mobileNumber: sanitizedContact.replace(/^91/, '') }
                        ]
                    }).lean();
                    if (builder && builder.subscription && builder.subscription.priorityScore) {
                        builderPriority = builder.subscription.priorityScore;
                    }
                }

                return {
                    ...listing,
                    id: listing._id.toString(),
                    price: formattedPrice,
                    date: formattedDate,
                    reraDate: formattedReraDate,
                    builderPriority: builderPriority
                };
            })
        );

        res.status(200).json({
            message: "All housing properties listed below.",
            count: formattedListings.length,
            housingFlatsList: formattedListings
        });
    } catch (error) {
        console.error("Error fetching housing listings:", error.message);
        res.status(500).json({ message: "Server error while fetching housing listings." });
    }
};

// Route 3: Update a housing listing by its ID
export const updateHousingListingById = async (req, res) => {
    const { id } = req.params;
    // ✅ CORRECTED: Destructure tenantType
    const { location, area, propertyType, price, name, contact, date, projectName, builderName, carpetArea } = req.body || {};

    try {
        const update = {
            location,
            area,
            propertyType,
            price: parsePrice(price),
            projectName, // ✅ Added projectName
            builderName, // ✅ Added builderName
            carpetArea, // ✅ Added carpetArea
            contact: cleanMobileNumber(contact),
            date,
        };

        const result = await Housing.findByIdAndUpdate(id, { $set: update }, { new: true });

        if (result) {
            res.status(200).json({
                message: `Rent listing with ID ${id} updated successfully.`,
                updatedListing: result,
            });
        } else {
            res.status(404).json({ message: "No rent listing found for the given ID." });
        }
    } catch (error) {
        console.error("Error updating rent listing:", error.message);
        res.status(500).json({ message: "Server error while updating listing." });
    }
};

// Route 4: Delete a housing listing by its ID
export const deleteHousingListingById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Housing.findByIdAndDelete(id);

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

// Route 5: Send Interest SMS (Mock)
export const sendInterestSMS = async (req, res) => {
    const { propertyOwnerContact, propertyDetails } = req.body;
    const senderMobile = req.mobileNumber; // From verifyAccessToken

    try {
        console.log("DEBUG: sendInterestSMS called");
        console.log("DEBUG Body:", JSON.stringify(req.body, null, 2));

        if (!propertyOwnerContact || !senderMobile) {
            return res.status(400).json({ message: "Missing contact information." });
        }

        // --- REAL SMS PROVIDER INTEGRATION POINT ---
        // Example: await axios.post('https://api.textlocal.in/send/', { ... });


        // --- 3. Save Click Data for Analytics ---
        try {
            let interactionType = (propertyDetails.type || propertyDetails.propertyType || 'rent').toLowerCase();
            const validTypes = ['rent', 'sell', 'commercial'];

            // If the type is like "4 bhk", it's not a valid interaction type, so default to 'rent' for Housing
            if (!validTypes.includes(interactionType)) {
                interactionType = 'rent';
            }

            await ContactClick.create({
                userId: req.userId,
                propertyId: propertyDetails.id || 'unknown',
                propertyType: interactionType,
                ownerContact: propertyOwnerContact,
                userName: senderMobile // Using mobile as proxy for name if unavailable
            });
            console.log("Analytics: Click recorded.");
        } catch (analyticsError) {
            console.error("Analytics Error: Failed to record click.", analyticsError);
        }

        // Format property details for the message
        let propertyInfo = "property";
        if (propertyDetails && typeof propertyDetails === 'object') {
            const { type, location, price, id } = propertyDetails;
            const priceText = price ? ` listed at ${price}` : '';
            const locationText = location ? ` in ${location}` : '';
            const typeText = type ? `${type}` : 'Property';
            propertyInfo = `${typeText}${locationText}${priceText}`;
        }

        // --- LOGGING (Restored as requested) ---
        const timestamp = new Date().toLocaleString();
        console.log("\n================ [SMS SERVICE LOG] ================");
        console.log(`TIME     : ${timestamp}`);
        console.log(`STATUS   : WHATSAPP API TRIGGERED`);
        console.log(`FROM     : SYSTEM (on behalf of ${senderMobile})`);
        console.log(`TO       : ${propertyOwnerContact}`);
        console.log(`CONTENT  : "Hello , User with mobile ${senderMobile} is interested in your ${propertyInfo}. Please contact them."`);
        console.log("===================================================\n");

        // Create WhatsApp Message
        // Template: property_interest
        // Variables: {{1}} = senderMobile, {{2}} = propertyInfo
        sendWhatsAppMessage(propertyOwnerContact, "property_interest", [senderMobile, propertyInfo])
            .then(res => {
                if (!res.success) console.warn("WhatsApp Send Failed");
            })
            .catch(err => console.error("WhatsApp Send Validation Error", err));

        res.status(200).json({ message: "Interest expressed successfully. SMS/WhatsApp sent." });

    } catch (error) {
        console.error("Error sending SMS:", error.message);
        res.status(500).json({ message: "Server error while sending SMS." });
    }
};

//Route 6: Get a housing listing by priority (for public access)
export const searchHousingProperties = async (req, res) => {
  const housingProperties = await Housing.find({
    location: req.query.location
  })
  .sort({ builderPriority: -1, createdAt: -1 })
  .limit(20);

  res.json(housingProperties);
};
