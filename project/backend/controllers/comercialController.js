import Commercial from "../models/Commercial.js";
import Builder from "../models/Builder.js";
import ContactClick from "../models/ContactClick.js";
import { sendWhatsAppMessage } from "./whatsappController.js";

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
    const { contact, area, location, propertyType, price, date, carpetArea, projectName, builderName } = req.body || {};

    try {
        // Relax 'name' requirement if 'projectName' is provided.
        if (!contact || !area || !location || !propertyType || !price || !date|| !projectName || !carpetArea) {
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
        const duplicateListing = await Commercial.findOne({
            contact: sanitizedContact,
            location,
            area,
            propertyType,
            price: parsePrice(price),
        });

        if (duplicateListing) {
            return res.status(409).json({
                message: "A listing with the same details already exists. Please modify at least one attribute."
            });
        }

        const newListing = new Commercial({
            location,
            area,
            carpetArea,
            propertyType,
            price: parsePrice(price),
            date,
            contact: sanitizedContact,
            projectName: projectName || name || '', // Use projectName or generic name
            builderName: builderName || builder.fullName, // ✅ Added builderName using builder info
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
        const listings = await Commercial.find().lean();

        // Fetch builder information for each listing to get priorityScore
        const formattedListings = await Promise.all(
            listings.map(async (listing) => {
                const formattedPrice = (typeof listing.price === 'number' && !isNaN(listing.price))
                    ? `₹${new Intl.NumberFormat('en-IN').format(listing.price)}`
                    : "Price on request";

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
                    builderPriority: builderPriority
                };
            })
        );

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
    const { location, area, propertyType, price, name, contact, date, ownershipType, projectName, builderName, carpetArea } = req.body || {};

    try {
        const update = {
            location,
            area,
            propertyType,
            price: parsePrice(price),
            projectName: projectName || name, // Update projectName
            userName: name, // Keep simplified name ref if needed
            contact: cleanMobileNumber(contact),
            date,
            ownershipType,
            builderName, // ✅ Allow updating builderName
            carpetArea // ✅ Allow updating carpetArea
        };

        const result = await Commercial.findByIdAndUpdate(id, { $set: update }, { new: true });

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
        const result = await Commercial.findByIdAndDelete(id);

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
        console.log("DEBUG: Commercial sendInterestSMS called");
        console.log("DEBUG Body:", JSON.stringify(req.body, null, 2));

        if (!propertyOwnerContact || !senderMobile) {
            return res.status(400).json({ message: "Missing contact information." });
        }

        // --- REAL SMS PROVIDER INTEGRATION POINT ---

        // --- 3. Save Click Data for Analytics ---
        try {
            await ContactClick.create({
                userId: req.userId,
                propertyId: propertyDetails.id || 'unknown',
                propertyType: 'commercial', // Explicitly commercial
                ownerContact: propertyOwnerContact,
                userName: senderMobile
            });
            console.log("Analytics: Commercial Click recorded.");
        } catch (analyticsError) {
            console.error("Analytics Error: Failed to record click.", analyticsError);
        }

        // Format property details for the message
        let propertyInfo = "commercial property";
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
        console.log(`STATUS   : WHATSAPP API TRIGGERED (COMMERCIAL)`);
        console.log(`FROM     : SYSTEM (on behalf of ${senderMobile})`);
        console.log(`TO       : ${propertyOwnerContact}`);
        console.log(`CONTENT  : "Hello , User with mobile ${senderMobile} is interested in your commercial ${propertyInfo}. Please contact them."`);
        console.log("===================================================\n");

        // Create WhatsApp Message
        // Template: property_interest
        // Variables: {{1}} = senderMobile, {{2}} = propertyInfo
        sendWhatsAppMessage(propertyOwnerContact, "property_interest", [senderMobile, propertyInfo])
            .then(res => {
                if (!res.success) console.warn("Commercial WhatsApp Send Failed");
            })
            .catch(err => console.error("Commercial WhatsApp Send Validation Error", err));

        res.status(200).json({ message: "Interest expressed successfully. SMS/WhatsApp sent." });

    } catch (error) {
        console.error("Error sending SMS:", error.message);
        res.status(500).json({ message: "Server error while sending SMS." });
    }
};

//Route 6: Get all comercial listings by priority for public access (Brokers)
export const searchCommercialProperties = async (req, res) => {
  const commercialProperties = await Commercial.find({
    location: req.query.location
  })
  .sort({ builderPriority: -1, createdAt: -1 })
  .limit(20);

  res.json(commercialProperties);
};
