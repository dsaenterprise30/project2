import mongoose from 'mongoose';

const housingPropertySchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    area: {
        type: String,
    },
    carpetArea: {
        type: Number,
    },
    propertyType: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    builderName: {
        type: String,
    },
    reraDate: {
        type: Date,
    },
    contact: {
        type: String,
        required: [true, 'Mobile number is required.'],
        trim: true,
        match: [/^91+[0-9]{10}$/, 'Please fill a valid 10-digit mobile number.'],
        index: true // ✅ Index for faster lookups
    },
}, {
    timestamps: true
});

const housingProperty = mongoose.model('housingProperty', housingPropertySchema, 'housingproperties');

// ✅ Ensure indexes are built when model loads
housingProperty.init()
    .then(() => console.log(""))
    .catch(err => console.error("❌ Error ensuring housingProperty indexes:", err));

export default housingProperty;