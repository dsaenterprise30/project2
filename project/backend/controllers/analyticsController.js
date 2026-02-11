import Comercial from "../models/Commercial.js"; // Ensure this is imported
import ContactClick from "../models/ContactClick.js"; // Restored import
import User from "../models/User.js"; // Added missing User import

// Get Analytics Data
export const getClickAnalytics = async (req, res) => {
    try {
        // 1. Total Clicks
        const totalClicks = await ContactClick.countDocuments();

        // 2. Clicks by Property Type
        const clicksByType = await ContactClick.aggregate([
            { $group: { _id: "$propertyType", count: { $sum: 1 } } }
        ]);

        // Format for frontend: { rent: 10, sell: 5, commercial: 2 }
        const clicksByTypeMap = { rent: 0, sell: 0, commercial: 0 };
        clicksByType.forEach(item => {
            clicksByTypeMap[item._id] = item.count;
        });

        // 3. Recent Clicks (Last 50) - Populated with user data if needed, but schema stores basic info
        const recentClicks = await ContactClick.find()
            .sort({ clickedAt: -1 })
            .limit(50)
            .populate("userId", "fullName mobileNumber");

        res.json({
            status: "success",
            data: {
                totalClicks,
                clicksByType: clicksByTypeMap,
                recentClicks
            }
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Server error fetching analytics." });
    }
};

// Get Analytics for a Specific User (Inbound Leads)

import RentFlat from "../models/Housing.js"; // Using Housing model for rent/sell? Or are they separate?
// Note: In housingController, housingProperty is used. Let's assume Housing.js covers rent/sell via propertyType check or separate collections?
// Based on housingController, getAllHousingListings fetches from HousingProperty.
// If your system splits Rent/Sell into different models, fetch accordingly.
// The user imports were commented out in the original file, so I'm re-adding them based on usage.
// Assuming RentFlat/SellFlat logic was intended but Housing.js is the actual model?
// In housingController, `housingProperty` is used for "housing" listings.
// Let's use housingProperty for 'rent' and 'sell' if they share the collection.

import Builder from "../models/Builder.js";

export const getUserInterests = async (req, res) => {
    const { userId } = req.params;
    console.log(`[DEBUG] getUserInterests called for userId: ${userId}`);
    try {
        let user = await User.findById(userId);
        let userType = 'User';

        if (!user) {
            console.log(`[DEBUG] User not found in User collection, checking Builder collection: ${userId}`);
            user = await Builder.findById(userId);
            userType = 'Builder';
        }

        if (!user) {
            console.log(`[DEBUG] User/Builder not found: ${userId}`);
            return res.status(404).json({ message: "User/Builder not found." });
        }

        let mobileStr = String(user.mobileNumber);
        // Create variants of the mobile number to search
        const mobileRaw = mobileStr.replace(/\D/g, '');
        const withPrefix = mobileRaw.startsWith('91') ? mobileRaw : '91' + mobileRaw;
        const withoutPrefix = mobileRaw.startsWith('91') ? mobileRaw.substring(2) : mobileRaw;

        console.log(`[DEBUG] Searching leads for ownerContact variants: Raw=${mobileRaw}, WithPrefix=${withPrefix}, WithoutPrefix=${withoutPrefix}`);

        const inboundLeads = await ContactClick.find({
            $or: [
                { ownerContact: mobileRaw },
                { ownerContact: withPrefix },
                { ownerContact: withoutPrefix }
            ]
        })
            .sort({ clickedAt: -1 })
            .populate("userId", "fullName mobileNumber");

        console.log(`[DEBUG] Found ${inboundLeads.length} raw leads`);

        // Enhance leads with property details
        const enhancedLeads = await Promise.all(inboundLeads.map(async (lead) => {
            let propertyDetails = null;
            try {
                if (lead.propertyType === 'commercial') {
                    propertyDetails = await Comercial.findById(lead.propertyId).lean();
                } else {
                    // Default to Housing for rent/sell
                    // Check if lead.propertyId is valid ObjectId?
                    // If it's "unknown", mongo might throw CastError if findById expects ObjectId.
                    if (lead.propertyId && lead.propertyId !== 'unknown') {
                        propertyDetails = await RentFlat.findById(lead.propertyId).lean();
                    }
                }
            } catch (err) {
                console.warn(`[DEBUG] Could not fetch property details for ID ${lead.propertyId}:`, err.message);
            }

            return {
                ...lead.toObject(),
                propertyDetails: propertyDetails ? {
                    location: propertyDetails.location,
                    price: propertyDetails.price,
                    type: propertyDetails.propertyType || lead.propertyType,
                    areaName: propertyDetails.area,
                    builderName: propertyDetails.builderName,
                    projectName: propertyDetails.projectName,
                    reraRegistrationDate: propertyDetails.reraDate
                } : { location: "Unknown", price: "N/A", propertyType: lead.propertyType.toUpperCase() }
            };
        }));

        res.json({
            status: "success",
            data: {
                user: {
                    id: user._id,
                    name: user.fullName,
                    mobile: user.mobileNumber
                },
                leads: enhancedLeads
            }
        });
    } catch (error) {
        console.error("Error fetching user interests:", error);
        res.status(500).json({ message: "Server error fetching user interests. " + error.message });
    }
};

// Get all leads for a specific builder by contact number
export const getLeadsByBuilder = async (req, res) => {
    try {
        const { builderContact } = req.params;

        if (!builderContact) {
            return res.status(400).json({ message: "Builder contact number is required." });
        }

        // Clean the contact number
        const cleanContact = builderContact.replace(/\D/g, '');

        // Find all contact clicks where the owner contact matches the builder's contact
        // Try multiple formats: with/without 91 prefix
        const leads = await ContactClick.find({
            $or: [
                { ownerContact: cleanContact },
                { ownerContact: '91' + cleanContact },
                { ownerContact: cleanContact.replace(/^91/, '') }
            ]
        })
            .sort({ clickedAt: -1 })
            .populate("userId", "fullName mobileNumber")
            .lean();

        // Format the leads for display
        const formattedLeads = leads.map(lead => ({
            id: lead._id,
            interestedUser: {
                name: lead.userId?.fullName || lead.userName || 'Unknown',
                contact: lead.userId?.mobileNumber || 'N/A'
            },
            propertyId: lead.propertyId,
            propertyType: lead.propertyType,
            ownerContact: lead.ownerContact,
            clickedAt: lead.clickedAt,
            formattedDate: new Date(lead.clickedAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
            })
        }));

        res.status(200).json({
            success: true,
            message: `Found ${formattedLeads.length} leads for builder contact ${builderContact}`,
            count: formattedLeads.length,
            builderContact: builderContact,
            leads: formattedLeads
        });

    } catch (error) {
        console.error("Error fetching leads by builder:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching leads."
        });
    }
};
