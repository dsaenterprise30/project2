import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const mobileNumber = "7499455975";
        const fullName = "sahil";
        const password = "123456";

        // Check if user already exists
        let user = await User.findOne({ mobileNumber });

        // Hash the password so the login controller's bcrypt.compare works
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            console.log(`User ${mobileNumber} already exists in Users collection. Updating password and name.`);
            user.fullName = fullName;
            user.password = hashedPassword;
            await user.save();
            console.log("✅ User updated successfully!");
        } else {
            user = await User.create({
                fullName,
                mobileNumber,
                password: hashedPassword,
            });
            console.log("✅ New user created in Users collection successfully!");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

createTestUser();
