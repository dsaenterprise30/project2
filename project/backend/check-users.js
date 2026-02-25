import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Builder from './models/Builder.js';
import User from './models/User.js';
import Admin from './models/Admin.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('--- BUILDERS ---');
    const builders = await Builder.find({ mobileNumber: { $in: ['7499455975', '917499455975', 7499455975, 917499455975] } });
    builders.forEach(b => console.log('Builder:', b.fullName, typeof b.mobileNumber, b.mobileNumber));

    console.log('--- USERS ---');
    const users = await User.find({ mobileNumber: { $in: ['7499455975', '917499455975', 7499455975, 917499455975] } });
    users.forEach(b => console.log('User:', b.fullName, typeof b.mobileNumber, b.mobileNumber));

    console.log('--- ADMINS ---');
    const admins = await Admin.find({ mobileNumber: { $in: ['7499455975', '917499455975', 7499455975, 917499455975] } });
    admins.forEach(b => console.log('Admin:', b.fullName, typeof b.mobileNumber, b.mobileNumber));

    process.exit(0);
});
