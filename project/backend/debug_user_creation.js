import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const debugCreateUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const fullName = "Parshva Shah";
        const rawMobile = "9324771296";
        const password = "password123";

        console.log(`Attempting to create user: ${fullName}, ${rawMobile}`);

        // Logic from controller
        let mobileStr = String(rawMobile);
        if (!mobileStr.startsWith('91')) {
            mobileStr = '91' + mobileStr;
        }
        const formattedMobile = Number(mobileStr);
        console.log(`Formatted Mobile: ${formattedMobile} (Type: ${typeof formattedMobile})`);

        const existingUser = await User.findOne({ mobileNumber: formattedMobile });
        if (existingUser) {
            console.log("User already exists!");
            // We might want to try saving a NEW unique one to test saving logic if this one exists
            // But for now let's see if this query works.
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                fullName,
                mobileNumber: formattedMobile,
                password: hashpassword,
                subscriptionActive: false,
                subscriptionStatus: "Inactive",
                subscriptionExpiry: null,
                hasUsedTrial: false,
            });

            console.log("Saving user...");
            await newUser.save();
            console.log("User saved successfully!");
        }

    } catch (error) {
        console.error("FATAL ERROR:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugCreateUser();
