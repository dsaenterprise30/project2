import ContactClick from "../models/ContactClick.js";

// Get Analytics Data
export const getClickAnalytics = async (req, res) => {
    try {
        // 1. Total Clicks
        const totalClicks = await ContactClick.countDocuments();

        // 2. Clicks by Property Type
        const clicksByType = await ContactClick.aggregate([
            { $group: { _id: "$propertyType", count: { $sum: 1 } } }
        ]);

        // Format for frontend: { rent: 10, sell: 5 }
        const clicksByTypeMap = { rent: 0, sell: 0 };
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
import User from "../models/User.js";
import RentFlat from "../models/rentflats.js";
import SellFlat from "../models/sellflats.js";

export const getUserInterests = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Search for clicks where this user is the owner (contact matches)
        // Since mobileNumber is Number in User but String in ContactClick, convert.
        // Also handling +91 prefix if inconsistent.
        // Best approach: Match stringified version or regex.
        // ContactClick.ownerContact is saved as string.

        let mobileStr = String(user.mobileNumber);
        // Sometimes saved with +91 or just 91. 
        // Let's assume strict match for now based on how we save it.

        const inboundLeads = await ContactClick.find({
            ownerContact: mobileStr
        })
            .sort({ clickedAt: -1 })
            .populate("userId", "fullName mobileNumber");

        // Enhance leads with property details
        const enhancedLeads = await Promise.all(inboundLeads.map(async (lead) => {
            let propertyDetails = null;
            try {
                if (lead.propertyType === 'rent') {
                    propertyDetails = await RentFlat.findById(lead.propertyId).select("location propertyType price area");
                } else if (lead.propertyType === 'sell') {
                    propertyDetails = await SellFlat.findById(lead.propertyId).select("location propertyType price area");
                }
            } catch (err) {
                console.warn(`Could not fetch property details for ID ${lead.propertyId}:`, err.message);
            }

            return {
                ...lead.toObject(),
                propertyDetails: propertyDetails || { location: "Unknown", price: "N/A", propertyType: lead.propertyType.toUpperCase() }
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
        res.status(500).json({ message: "Server error fetching user interests." });
    }
};
