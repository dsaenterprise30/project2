import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const adminNumber = process.env.ADMIN_NUMBER;
        console.log('Admin Number in .env:', adminNumber);

        const admin = await User.findOne({ 
            $or: [
                { mobileNumber: adminNumber },
                { mobileNumber: '+' + adminNumber },
                { mobileNumber: adminNumber.replace(/^91/, '') },
                { mobileNumber: '+91' + adminNumber.replace(/^91/, '') }
            ]
        });

        if (admin) {
            console.log('\n--- Admin User Found ---');
            console.log('Full Name:', admin.fullName);
            console.log('Mobile Number:', admin.mobileNumber);
            console.log('Type:', admin.type);
        } else {
            console.log('\n❌ Admin user not found with any expected format.');
        }

    } catch (error) {
        console.error('❌ Error checking admin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmin();
