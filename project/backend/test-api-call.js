import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessToken } from './controllers/jwtController.js';
import User from './models/User.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ mobileNumber: 917021062721 }) || await User.findOne();
        if (!user) throw new Error("No user found to impersonate");

        const token = generateAccessToken(user);

        console.log("Sending fetch request with token:", token.substring(0, 20) + '...');

        const response = await fetch('http://localhost:3000/api/commercial/send-interest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                propertyOwnerContact: '7499455975', // sahil contact
                propertyDetails: {
                    id: new mongoose.Types.ObjectId().toString(),
                    type: '2 BHK',
                    location: 'Malad West',
                    price: 42000
                }
            })
        });

        const data = await response.json().catch(e => response.statusText);
        console.log("Status:", response.status);
        console.log("Response:", data);

    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
