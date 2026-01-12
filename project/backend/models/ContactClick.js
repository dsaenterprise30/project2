import mongoose from "mongoose";

const contactClickSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userName: {
        type: String, // Store snapshot of name in case user is deleted
    },
    propertyId: {
        type: String, // Can be ObjectId from RentFlat/SellFlat, but keeping loose for flexibility
        required: true
    },
    propertyType: {
        type: String,
        enum: ["rent", "sell"],
        required: true
    },
    ownerContact: {
        type: String,
        required: true
    },
    clickedAt: {
        type: Date,
        default: Date.now
    }
});

const ContactClick = mongoose.model("ContactClick", contactClickSchema);
export default ContactClick;
