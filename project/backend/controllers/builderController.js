import express from "express";
import Builder from "../models/Builder.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Route 1: Builder Registration
export const registerBuilder = async (req, res) => {
    const { fullName, mobileNumber, password } = req.body;
    try {
        if (!fullName || !mobileNumber || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }
        const existingUser = await Builder
            .findOne({ mobileNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this mobile number already exists.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        const newUser = new Builder({
            fullName,
            mobileNumber,
            password: hashpassword,
        });
        await newUser.save();
        res.status(201).json({
            status: 'success',
            message: '✅ You registered as Builder successfully.',
            data: {
                fullName: newUser.fullName,
                mobileNumber: newUser.mobileNumber,
            }
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Route 2: Builder Login
export const loginBuilder = async (req, res) => {
    const { mobileNumber, password } = req.body;
    try {
        if (!mobileNumber || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }

        if (length.password < 6) {
            return res.status(400).json({ message: 'Password should be atleast 6 digits long.' });
        }
        const user = await Builder.findOne({ mobileNumber });
        if (!user) {
            return res.status(400).json({ message: 'Invalid mobile number or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid mobile number or password.' });
        }
        const payload = {
            userId: user._id,
            role: 'builder'
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            status: 'success',
            message: '✅ You logged in as Builder successfully.',
            token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Route 3: Get All Builders (Admin Only)
export const getAllBuilders = async (req, res) => {
    console.log("[DEBUG] getAllBuilders called");
    try {
        const builders = await Builder.find().select('-password');
        console.log(`[DEBUG] Found ${builders.length} builders`);
        res.status(200).json(builders);
    } catch (error) {
        console.error('Error fetching builders:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Route 3: Update a Builder by ID (Admin Only)
export const updateBuilderById = async (req, res) => {
    const { id } = req.params;
    const { fullName, password, subscriptionExpiry, planExpiryDate } = req.body;

    try {
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (subscriptionExpiry) updateData.subscriptionExpiry = subscriptionExpiry;
        if (planExpiryDate) updateData.planExpiryDate = planExpiryDate;

        // If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const result = await Builder.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (result) {
            return res.status(200).json({
                message: `Updated builder with ID ${id}.`,
                data: result
            });
        } else {
            return res.status(404).json({ message: "No builder found for the given ID." });
        }
    } catch (error) {
        console.error('Error updating builder:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Route 4: Delete a Builder by ID (Admin Only)
export const deleteBuilderById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Builder.findByIdAndDelete(id);
        if (result) {
            return res.status(200).json({
                message: `Deleted builder with ID ${id}.`,
            });
        } else {
            return res.status(404).json({ message: "No builder found for the given ID." });
        }
    } catch (error) {
        console.error('Error deleting builder:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Route 6: Validate builder by contact number (used before creating properties)
export const validateBuilderByContact = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required"
            });
        }

        // Clean the mobile number (remove non-digits)
        const cleanNumber = mobileNumber.replace(/\D/g, '');

        // Try both with and without 91 prefix
        const builder = await Builder.findOne({
            $or: [
                { mobileNumber: cleanNumber },
                { mobileNumber: '91' + cleanNumber },
                { mobileNumber: cleanNumber.replace(/^91/, '') }
            ]
        });

        if (!builder) {
            return res.status(404).json({
                success: false,
                message: "Builder not found with this contact number. Please register as a builder first."
            });
        }

        res.status(200).json({
            success: true,
            message: "Builder validated successfully",
            builder: {
                fullName: builder.fullName,
                mobileNumber: builder.mobileNumber,
                companyName: builder.companyName
            }
        });
    } catch (error) {
        console.error("Error validating builder:", error);
        res.status(500).json({
            success: false,
            message: "Server error while validating builder"
        });
    }
};
