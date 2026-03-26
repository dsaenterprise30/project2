import User from '../models/User.js';
import bcrypt from "bcrypt";
import express from 'express';
import jwt from "jsonwebtoken";
import { generateRefreshToken, generateAccessToken, sendTokenResponse } from './jwtController.js';
import Housing from '../models/Housing.js';
import Commercial from '../models/Commercial.js';
import Builder from '../models/Builder.js';

// ---- Global in-memory pending user store ----
const pendingUsers = {};

// Helper: add one calendar month to a date
const addOneMonth = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + 1);

  // If month rolled over (e.g., from 31st to next month shorter), adjust
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
};

//Route 1 - Register user
export const registerUser = async (req, res) => {
  const { fullName, mobileNumber, password, location, userType } = req.body;

  try {
    if (!fullName || !mobileNumber || !password || !location) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    // Normalize mobile number to 10 digits
    const last10Digits = String(mobileNumber).replace(/\D/g, '').slice(-10);
    const dbMobileNumber12 = Number("91" + last10Digits);
    const dbMobileNumber10 = Number(last10Digits);

    const existingUser = await User.findOne({ 
      mobileNumber: { $in: [dbMobileNumber12, dbMobileNumber10] }
    });
    if (existingUser) {
      return res.status(400).json({ msg: 'A user with this mobile number already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 30);

    const newUser = new User({
      fullName,
      mobileNumber: dbMobileNumber12,
      password: hashpassword,
      location,
      type: userType || 'Individual',
      subscriptionStatus: 'Active',
      subscriptionActive: true,
      subscriptionExpiry: trialExpiry,
      hasUsedTrial: true
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: '✅ User registered successfully.',
      data: {
        fullName: newUser.fullName,
        contact: newUser.mobileNumber,
        location: newUser.location
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};

//Route 2 - Login user
export const loginUser = async (req, res) => {
  const { mobileNumber, password } = req.body;
  try {
    if (!mobileNumber || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password should be at least 6 characters."
      });
    }

    // Normalize mobile number to 10 digits
    const last10Digits = String(mobileNumber).replace(/\D/g, '').slice(-10);
    const dbMobileNumber12 = Number("91" + last10Digits);
    const dbMobileNumber10 = Number(last10Digits);

    const existingUser = await User.findOne({ 
      mobileNumber: { $in: [dbMobileNumber12, dbMobileNumber10] }
    });
    if (!existingUser) {
      return res.status(400).json({
        message: "Mobile number is not registered."
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password does not match."
      });
    }

    // ✅ Login successful (subscription is active)
    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      token: generateAccessToken(existingUser), // assuming this embeds userId & mobileNumber
      data: {
        userId: existingUser._id,
        fullName: existingUser.fullName,
        mobileNumber: existingUser.mobileNumber,
        type: existingUser.type
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Route - Get User by Contact
export const getUserByContact = async (req, res) => {
  try {
    let { contact } = req.params;

    // Normalize to 91XXXXXXXXXX
    if (/^[0-9]{10}$/.test(contact)) {
      contact = "91" + contact;
    }

    // 1️⃣ Check in Builder collection
    const builders = await Builder.findOne({ mobileNumber: contact });
    if (builders) {
      if (builders.subscriptionStatus === "Active") {
        return res.json({
          message: "Builder",
          fullName: builders.fullName,
          mobileNumber: builders.mobileNumber.toString().slice(-10),
        });
      } else {
        return res.status(403).json({ message: "User is not active." });
      }
    }

    // 2️⃣ Check in housing
    const housingUserDetails = await Housing.findOne({ contact: contact });
    if (housingUserDetails) {
      return res.json({
        message: "housing",
        fullName: housingUserDetails.userName,
        mobileNumber: housingUserDetails.contact.toString().slice(-10),
      });
    }

    // 3️⃣ Check in commercial
    const commercialUserDetails = await Commercial.findOne({ contact: contact });
    if (commercialUserDetails) {
      return res.json({
        message: "sell",
        fullName: commercialUserDetails.userName,
        mobileNumber: commercialUserDetails.contact.toString().slice(-10),
      });
    }

    // 4️⃣ Not found anywhere → allow manual entry
    return res.status(200).json({
      message: "Data is not associated with this number, You can write the name manually",
      fullName: null,
      mobileNumber: contact.slice(-10),
    });

  } catch (err) {
    console.error("Error fetching user by contact:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

//Route 3 - Forgot Password
export const forgotPassword = async (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ msg: 'Please enter your mobile number.' });
  }

  try {
    const existingUser = await User.findOne({ mobileNumber: contact });
    if (!existingUser) {
      return res.status(400).json({ msg: 'Mobile number is not registered.' });
    }

    res.status(200).json({
      status: "success",
      message: "User exists. Proceed with OTP verification.",
    });

  } catch (error) {
    console.error('Error processing forgot password request:', error);
    res.status(500).json({ msg: 'Server error. Please try again later.' });
  }
};

//Route 4 - reset password
export const resetPassword = async (req, res) => {
  const { contact, confirmPassword, newPassword } = req.body;

  if (!contact || !confirmPassword || !newPassword) {
    return res.status(400).json({ msg: "Mobile number, confirm password and new password are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters long." });
  }

  try {
    const user = await User.findOne({ mobileNumber: contact });
    if (!user) {
      return res.status(400).json({ msg: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully. Please log in again.",
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
};

// Route 5 - Admin Login
export const adminLogin = async (req, res) => {
  const { mobileNumber, password } = req.body;
  try {
    if (!mobileNumber || !password) {
      return res.status(400).json({ message: "Mobile number and password are required." });
    }

    // Normalize input number to 10-digits
    const last10Digits = String(mobileNumber).replace(/\D/g, '').slice(-10);
    const searchNums = [Number("91" + last10Digits), Number(last10Digits)];

    // Try both 12-digit (91 prefix) and 10-digit formats in DB
    const user = await User.findOne({ 
      mobileNumber: { $in: searchNums }
    });

    if (!user) {
      return res.status(400).json({ message: "Admin not found in database" });
    }

    // Normalize admin number from .env to 10-digits
    const adminNumberEnv = process.env.ADMIN_NUMBER;
    const adminLast10 = String(adminNumberEnv).replace(/\D/g, '').slice(-10);

    if (last10Digits !== adminLast10) {
      return res.status(403).json({
        message: "Access denied, only admin can access."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌ Invalid password" });
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin logged in successfully',
      token: generateAccessToken(user),
      data: {
        fullName: user.fullName,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

//Route 7 - Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

//Route 9 - logout User
export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/"
    });

    res.status(200).json({
      message: "Logged Out Successfully - Come Back Soon!"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Route 10 - Create Subscription (manual / admin use only)
export const createSubscription = async (req, res) => {
  const userId = req.userId; // From verifyAccessToken middleware
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();

    // First subscription created manually – apply 7 days free + 1 month
    if (!user.hasUsedTrial) {
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7);
      const expiry = addOneMonth(trialEnd);

      user.subscriptionActive = true;
      user.subscriptionStatus = "Active";
      user.subscriptionExpiry = expiry;
      user.hasUsedTrial = true;
    } else {
      // Renewal – only 1 month, no free days
      const base = user.subscriptionExpiry && user.subscriptionExpiry > now
        ? user.subscriptionExpiry
        : now;

      const expiry = addOneMonth(base);
      user.subscriptionActive = true;
      user.subscriptionStatus = "Active";
      user.subscriptionExpiry = expiry;
    }

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Subscription activated successfully.",
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry
    });
  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Route 11 - Get Subscription Status
export const getSubscriptionStatus = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if subscription has expired
    if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
      user.subscriptionActive = false;
      user.subscriptionStatus = "Inactive";
      await user.save();
    }

    res.status(200).json({
      subscriptionActive: user.subscriptionActive,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry
    });
  } catch (error) {
    console.error("Get Subscription Status Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//route 12: delete user
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Route 13 - Update User (Admin only)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { password, subscriptionExpiry } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (subscriptionExpiry) {
      user.subscriptionExpiry = new Date(subscriptionExpiry);
      // Automatically activate if expiry is in future
      if (user.subscriptionExpiry > new Date()) {
        user.subscriptionActive = true;
        user.subscriptionStatus = "Active";
      }
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Route 14 - Admin Register User (Direct Creation)
export const registerUserByAdmin = async (req, res) => {
  let { fullName, mobileNumber, password, location, userType } = req.body;

  try {
    if (!fullName || !mobileNumber || !password || !location) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    // Ensure mobile number starts with 91 (as per Schema validation)
    let mobileStr = String(mobileNumber);
    if (!mobileStr.startsWith('91')) {
      mobileStr = '91' + mobileStr;
    }
    const formattedMobile = Number(mobileStr);

    const existingUser = await User.findOne({ mobileNumber: formattedMobile });
    if (existingUser) {
      return res.status(400).json({ msg: 'A user with this mobile number already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    // Create user directly (skip pending state if admin creates it)
    const newUser = new User({
      fullName,
      mobileNumber: formattedMobile,
      password: hashpassword,
      location,
      type: userType || 'Individual',
      subscriptionActive: false,
      subscriptionStatus: "Inactive",
      subscriptionExpiry: null,
      hasUsedTrial: false,
    });

    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: '✅ User created successfully by Admin.',
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        mobileNumber: newUser.mobileNumber,
        location: newUser.location
      }
    });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    res.status(500).json({ msg: 'Server error creating user.' });
  }
};
