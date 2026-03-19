import Commercial from "../models/Commercial.js";
import Builder from "../models/Builder.js";
import ContactClick from "../models/ContactClick.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import mongoose from "mongoose";
import { sendWhatsAppMessage } from "./whatsappController.js";
import { sendInterestEmail } from "./emailController.js";

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
    const { contact, area, location, propertyType, price, date, carpetArea, projectName, builderName, possessionDate, commercialType } = req.body || {};

    try {
        // Relax 'name' requirement if 'projectName' is provided.
        if (!contact || !area || !location || !propertyType || !price || !date || !projectName || !carpetArea) {
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
            builderId: builder._id,
            builderPlan: builder.subscription ? builder.subscription.planName : "free",
            builderPriority: builder.subscription ? builder.subscription.priorityScore : 0,
            possessionDate: possessionDate,
            commercialType: commercialType
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
        const listings = await Commercial.find()
            .sort({ builderPriority: -1, createdAt: -1 })
            .lean();

        // Format listings (using denormalized builderPriority)
        const formattedListings = listings.map((listing) => {
            const formattedPrice = (typeof listing.price === 'number' && !isNaN(listing.price))
                ? `₹${new Intl.NumberFormat('en-IN').format(listing.price)}`
                : "Price on request";

            return {
                ...listing,
                id: listing._id.toString(),
                price: formattedPrice,
                builderPriority: listing.builderPriority || 0
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
    const { location, area, propertyType, price, name, contact, date, projectName, builderName, carpetArea, possessionDate, commercialType } = req.body || {};

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
            builderName, // ✅ Allow updating builderName
            carpetArea, // ✅ Allow updating carpetArea
            possessionDate,
            commercialType
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

        // Fetch Sender Details (The one clicking 'Contact')
        let senderEmail = null;
        let senderName = "A user";
        try {
            // Attempt to find the sender's name and email
            // Account for '91' prefix differences and Number vs String types in DB
            const cleanSenderMobile = senderMobile.toString().replace(/^91/, '');
            const senderQuery = {
                $or: [
                    { mobileNumber: cleanSenderMobile },
                    { mobileNumber: '91' + cleanSenderMobile },
                    { mobileNumber: senderMobile },
                    { mobileNumber: Number(cleanSenderMobile) },
                    { mobileNumber: Number('91' + cleanSenderMobile) }
                ]
            };

            const [senderBuilder, senderAdmin, senderCommon] = await Promise.all([
                Builder.findOne(senderQuery),
                Admin.findOne(senderQuery).catch(() => null),
                User.findOne(senderQuery).catch(() => null)
            ]);

            if (senderCommon) {
                senderName = senderCommon.fullName || "User";
                senderEmail = senderCommon.email || null;
            } else if (senderBuilder) {
                senderName = senderBuilder.fullName || senderBuilder.builderName || "User";
                senderEmail = senderBuilder.email || null;
            } else if (senderAdmin) {
                senderName = senderAdmin.fullName || "Admin User";
                senderEmail = senderAdmin.email || null;
            }
        } catch (error) {
            console.error("Error fetching sender details:", error.message);
        }

        // Fetch Builder to get their email
        const cleanOwnerContact = String(propertyOwnerContact).replace(/^91/, '').replace(/\D/g, '');
        console.log(`DEBUG: Cleaned owner contact for DB lookup: ${cleanOwnerContact}`);
        const builder = await Builder.findOne({
            $or: [
                { mobileNumber: cleanOwnerContact },
                { mobileNumber: '91' + cleanOwnerContact },
                { mobileNumber: propertyOwnerContact },
                { mobileNumber: Number(cleanOwnerContact) },
                { mobileNumber: Number('91' + cleanOwnerContact) }
            ]
        });

        if (builder && builder.email) {
            // Check if builder has an active subscription (not free, not expired)
            const sub = builder.subscription || {};
            const planName = sub.planName || sub.plan || 'free';

            // Trial active if status is Active AND expiry date hasn't passed
            const isTrialActive = builder.subscriptionStatus === 'Active' &&
                (!builder.planExpiryDate || new Date(builder.planExpiryDate) > new Date());

            const hasActivePlan = isTrialActive || (planName !== 'free' && sub.status !== 'expired');

            if (hasActivePlan) {
                console.log(`Email Service (Commercial): Sending interest to ${builder.email} from ${senderEmail || senderMobile}`);
                // Pass the senderEmail, senderName, and builderName
                const builderName = builder.fullName || builder.builderName || "Builder";

                try {
                    const res = await sendInterestEmail(builder.email, senderMobile, propertyInfo, senderEmail, senderName, builderName);
                    if (!res.success) console.warn("Commercial Email Send Failed:", res.error);
                } catch (err) {
                    console.error("Commercial Email Send Validation Error", err);
                }
            } else {
                console.log(`Email Service (Commercial): Builder ${builder.email} has no active plan (Free/Expired). Email suppressed. Lead saved in admin panel.`);
            }
        } else {
            console.warn(`Email Service (Commercial): Builder not found or email missing for contact ${propertyOwnerContact}`);
        }

        // --- WHATSAPP CODE PRESERVED (Commented Out) ---
        /*
        // Create WhatsApp Message
        // Template: property_interest
        // Variables: {{1}} = senderMobile, {{2}} = propertyInfo
        sendWhatsAppMessage(propertyOwnerContact, "property_interest", [senderMobile, propertyInfo])
            .then(res => {
                if (!res.success) console.warn("Commercial WhatsApp Send Failed");
            })
            .catch(err => console.error("Commercial WhatsApp Send Validation Error", err));
        */

        res.status(200).json({ message: "Interest expressed successfully. Email sent to owner." });

    } catch (error) {
        console.error("Error sending SMS:", error.message);
        res.status(500).json({ message: "Server error while sending SMS." });
    }
};

//Route 6: Get all comercial listings by priority for public access (Agents)
export const searchCommercialProperties = async (req, res) => {
    const commercialProperties = await Commercial.find({
        location: req.query.location
    })
        .sort({ builderPriority: -1, createdAt: -1 })
        .limit(20);

    res.json(commercialProperties);
};
