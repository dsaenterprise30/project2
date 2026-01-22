import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config();

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        const mobileToUpdate = 917021062721;
        const newPassword = 'admin@123'; // NEW PASSWORD

        console.log(`\nResetting password for mobile: ${mobileToUpdate}`);
        console.log(`New password will be: ${newPassword}`);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hashed successfully');

        // Update the user
        const result = await usersCollection.updateOne(
            { mobileNumber: mobileToUpdate },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            console.log('❌ No user found with that mobile number');
        } else if (result.modifiedCount === 1) {
            console.log('✅ Password updated successfully!');
            console.log('\n📝 Login Credentials:');
            console.log(`   Mobile: +91${mobileToUpdate}`);
            console.log(`   Password: ${newPassword}`);
        } else {
            console.log('⚠️ User found but password was not changed (maybe same as before?)');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

resetPassword();
