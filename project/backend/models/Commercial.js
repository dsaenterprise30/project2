import mongoose from 'mongoose';

const comercialPropertySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    projectName: {
        type: String,
        required: false
    },
    builderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Builder',
    },
    builderName: {
        type: String,
    },
    possessionDate: {
        type: Date,
    },
    location: {
        type: String,
        required: true
    },
    area: {
        type: String
    },
    propertyType: String,
    commercialType: {
        type: String,
        required: false
    },
    carpetArea: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    contact: {
        type: String, // store as string for consistency
        required: [true, 'Mobile number is required.'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please fill a valid 10-digit mobile number.'],
    },
    date: {
        type: Date,
    },
    builderPlan: String,
    builderPriority: Number, // used for sorting
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

// Note: explicit index for `contact` removed to avoid collisions with existing DB indexes.
// If you need a new index, add it after cleaning up existing indexes in the DB.

const comercialProperty = mongoose.model('comercialProperty', comercialPropertySchema, 'comercialproperties');

// ✅ Ensure indexes build at startup
comercialProperty.init()
    .then(() => console.log(""))
    .catch(err => console.error("❌ Error ensuring comercialProperty indexes:", err));

export default comercialProperty;