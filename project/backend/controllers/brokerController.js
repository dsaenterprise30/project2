import express from "express";
import bcrypt from "bcryptjs";
import Brokers from "../models/Brokers.js";

const router = express.Router();

//Routes 1: Broker Registration
export const registerBroker = async (req, res) => {
    const { fullName, mobileNumber, password } = req.body;
    
      try {
        if (!fullName || !mobileNumber || !password) {
          return res.status(400).json({ message: 'Please enter all fields.' });
        }
    
        const existingUser = await Brokers.findOne({ mobileNumber });
        if (existingUser) {
          return res.status(400).json({ message: 'A user with this mobile number already exists.' });
        }
    
        if (password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
    
        pendingUsers[mobileNumber] = {
          fullName,
          mobileNumber,
          password: hashpassword
        };
    
        // ❗️User is created only as "not yet subscribed" – payment must happen
        const newUser = new User({
          fullName,
          mobileNumber,
          password: hashpassword,
        });
    
        await newUser.save();
    
        res.status(201).json({
          status: 'success',
          message: '✅ You registered as Broker successfully.',
          data: {
            fullName: newUser.fullName,
            mobileNumber: newUser.mobileNumber,
          }
        });
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
      }
    };

//Routes 2: Broker Login
export const loginBroker = async (req, res) => {
    const { mobileNumber, password } = req.body;

    try {
        if (!mobileNumber || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }
        const user = await Brokers.findOne({ mobileNumber });
        if (!user) {
            return res.status(400).json({ message: 'Invalid mobile number or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid mobile number or password.' });
        }
        res.status(200).json({
            status: 'success',
            message: '✅ Broker logged in successfully.',
            data: {
                fullName: user.fullName,
                mobileNumber: user.mobileNumber,
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

//Routes 3: Get All Brokers (Admin Only)
export const getAllBrokers = async (req, res) => {
    try {
        const brokers = await Brokers.find().select('-password'); // Exclude passwords
        res.status(200).json({
            status: 'success',
            data: brokers
        });
    } catch (error) {
        console.error('Error fetching brokers:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

//Routes 4: Get Broker by ID
export const getBrokerById = async (req, res) => {
    const { id } = req.params;
    try {
        const broker = await Brokers.findById(id).select('-password');
        if (!broker) {
            return res.status(404).json({ message: 'Broker not found.' });
        }
        res.status(200).json({
            status: 'success',
            data: broker
        });
    } catch (error) {
        console.error('Error fetching broker:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};