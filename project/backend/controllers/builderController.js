import express from "express";
import Builders from "../models/Builders.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Route 1: Builder Registration
export const registerBuilder = async (req, res) => {
    const { fullName, mobileNumber, password } = req.body;
    try {
        if (!fullName || !mobileNumber || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }
        const existingUser = await Builders
            .findOne({ mobileNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this mobile number already exists.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        const newUser = new Builders({
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
        const user = await Builders.findOne({ mobileNumber });
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

    try {
        const builders = await Builders.find().select('-password');
        res.status(200).json({
            status: 'success',
            data: builders
        });
    } catch (error) {
        console.error('Error fetching builders:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Route 4: Delete a Builder by ID (Admin Only)
export const deleteBuilderById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Builders.findByIdAndDelete(id);
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
