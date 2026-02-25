import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Commercial from './models/Commercial.js';
import Admin from './models/Admin.js';
import User from './models/User.js'; // MUST IMPORT
import Builder from './models/Builder.js';
import jwt from 'jsonwebtoken';
import { sendInterestSMS } from './controllers/comercialController.js';

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Create Admin if not exists
        let admin = await Admin.findOne({ mobileNumber: '917021062721' });
        if (!admin) {
            admin = await Admin.create({ fullName: 'Super Admin', mobileNumber: 917021062721, password: 'hash', email: 'admin@dsa.com' });
        }

        // 1. Mock Admin
        const req = {
            headers: {},
            userId: new mongoose.Types.ObjectId(), // MUST BE VALID OBJECTID
            mobileNumber: '917021062721', // Admin number from .env
            body: {
                propertyOwnerContact: '',
                propertyDetails: {}
            }
        };

        // 2. Find Sahil's commercial property in Malad West
        const property = await Commercial.findOne({
            location: { $regex: /malad west/i },
            $or: [
                { userName: { $regex: /sahil/i } },
                { projectName: { $regex: /sahil/i } },
                { builderName: { $regex: /sahil/i } }
            ]
        });

        if (!property) {
            console.log("Could not find commercial property for Sahil in Malad West");
            const sample = await Commercial.findOne({ location: { $regex: /malad west/i } });
            console.log("Here is a sample Malad West property instead:", sample);
            process.exit();
        }

        console.log(`Found property: ${property.projectName || property.userName} by Builder: ${property.builderName}`);
        console.log(`Contact: ${property.contact}`);

        // Update Sahil's builder profile to have an email so we can test sending
        let builder = await Builder.findOne({ mobileNumber: property.contact });
        if (builder) {
            console.log("Builder found. Assigning real email for test.");
            builder.email = "secondcount18@gmail.com";
            await builder.save();
        } else if (!builder) {
            console.log("Builder not found in DB! Creating one for this contact.");
            builder = await Builder.create({
                fullName: 'Sahil Test',
                mobileNumber: property.contact,
                password: 'test',
                email: 'secondcount18@gmail.com'
            });
        }

        req.body.propertyOwnerContact = property.contact;
        req.body.propertyDetails = {
            id: property._id.toString(),
            type: property.propertyType,
            location: property.location,
            price: property.price
        };

        const res = {
            status: (code) => {
                console.log(`Setting status code: ${code}`);
                return {
                    json: (data) => console.log(`Response [${code}]:`, data)
                }
            }
        };

        // 3. Trigger controller
        console.log("Triggering send interest API...");
        await sendInterestSMS(req, res);

        console.log("Waiting 5 seconds for background email service to finish...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log("Done testing.");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runTest();
