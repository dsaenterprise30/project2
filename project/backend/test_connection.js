import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('=== MongoDB Connection Test ===\n');
console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
console.log('\nAttempting to connect...\n');

// Extract connection details for debugging
const uri = process.env.MONGODB_URI;
if (uri) {
    try {
        const url = new URL(uri.replace('mongodb+srv://', 'https://'));
        console.log('Parsed Connection Details:');
        console.log('- Username:', url.username);
        console.log('- Password:', url.password ? '***' + url.password.slice(-3) : 'NOT SET');
        console.log('- Host:', url.hostname);
        console.log('- Database from URI:', url.pathname.replace('/', '') || 'NOT SPECIFIED');
    } catch (e) {
        console.log('Error parsing URI:', e.message);
    }
}

// Test connection with explicit database name
const connectionOptions = {
    dbName: process.env.DATABASE_NAME || 'realestate',
    serverSelectionTimeoutMS: 5000,
};

console.log('\nConnection Options:', connectionOptions);
console.log('\nConnecting...\n');

mongoose.connect(process.env.MONGODB_URI, connectionOptions)
    .then(() => {
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log('Database:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);

        // List collections
        return mongoose.connection.db.listCollections().toArray();
    })
    .then((collections) => {
        console.log('\nAvailable Collections:');
        collections.forEach(col => console.log('  -', col.name));

        console.log('\n✅ Connection test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ CONNECTION FAILED');
        console.error('\nError Details:');
        console.error('- Message:', error.message);
        console.error('- Code:', error.code);
        console.error('- CodeName:', error.codeName);

        if (error.code === 8000) {
            console.error('\n🔍 Authentication Error Detected!');
            console.error('\nPossible fixes:');
            console.error('1. Verify MongoDB Atlas user credentials:');
            console.error('   - Go to https://cloud.mongodb.com');
            console.error('   - Navigate to Database Access');
            console.error('   - Check if user "dsaenterprise" exists');
            console.error('   - Reset password if needed\n');
            console.error('2. Check Network Access:');
            console.error('   - Navigate to Network Access');
            console.error('   - Add your current IP or use 0.0.0.0/0 for testing\n');
            console.error('3. Verify connection string format:');
            console.error('   - Should be: mongodb+srv://username:password@cluster.mongodb.net/');
            console.error('   - Special characters in password must be URL encoded');
        }

        process.exit(1);
    });
