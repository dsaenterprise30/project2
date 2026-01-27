import dotenv from 'dotenv';
import mongoose from 'mongoose';
import housingProperty from './models/housingProperty.js';

dotenv.config();

const sampleProperties = [
    {
        projectName: "Sunflower Heights",
        address: "Plot 45, Sector 12, Malad West",
        location: "Malad West",
        area: "Orlem",
        carpetArea: 650,
        propertyType: "2 BHK",
        price: 8500000,
        builderName: "Lodha Builders",
        reraDate: new Date('2023-06-15'),
        contact: "919876543210",
        allocationStatus: "Possesion"
    },
    {
        projectName: "Green Valley Apartments",
        address: "Survey No. 234, Goregaon West",
        location: "Goregaon West",
        area: "Film City Road",
        carpetArea: 850,
        propertyType: "3 BHK",
        price: 12500000,
        builderName: "Oberoi Realty",
        reraDate: new Date('2024-01-20'),
        contact: "919123456789",
        allocationStatus: "Rora"
    },
    {
        projectName: "Skyline Residency",
        address: "Block C, Kandivali West",
        location: "Kandivali West",
        area: "Thakur Village",
        carpetArea: 550,
        propertyType: "1 BHK",
        price: 5500000,
        builderName: "Godrej Properties",
        reraDate: new Date('2023-11-10'),
        contact: "918765432109",
        allocationStatus: "Possesion"
    },
    {
        projectName: "Royal Towers",
        address: "Link Road, Andheri West",
        location: "Andheri West",
        area: "Versova",
        carpetArea: 1200,
        propertyType: "4 BHK",
        price: 18500000,
        builderName: "Kalpataru Ltd",
        reraDate: new Date('2024-03-05'),
        contact: "917890123456",
        allocationStatus: "Rora"
    },
    {
        projectName: "Eden Gardens",
        address: "Plot 78, Borivali West",
        location: "Borivali West",
        area: "IC Colony",
        carpetArea: 480,
        propertyType: "1 RK",
        price: 3800000,
        builderName: "Rustomjee",
        reraDate: new Date('2023-08-22'),
        contact: "916543210987",
        allocationStatus: "Possesion"
    },
    {
        projectName: "Crystal Palace",
        address: "Station Road, Dahisar West",
        location: "Dahisar West",
        area: "Dahisar Check Naka",
        carpetArea: 750,
        propertyType: "2.5 BHK",
        price: 9200000,
        builderName: "Tata Housing",
        reraDate: new Date('2024-02-14'),
        contact: "915432109876",
        allocationStatus: "Rora"
    }
];

async function insertSampleData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await housingProperty.deleteMany({});
        // console.log('🗑️  Cleared existing data\n');

        // Insert sample data
        const result = await housingProperty.insertMany(sampleProperties);
        console.log(`✅ Successfully inserted ${result.length} housing properties!\n`);

        console.log('📋 Sample Properties Added:');
        result.forEach((prop, index) => {
            console.log(`\n${index + 1}. ${prop.projectName}`);
            console.log(`   Location: ${prop.location} - ${prop.area}`);
            console.log(`   Type: ${prop.propertyType}`);
            console.log(`   Price: ₹${prop.price.toLocaleString('en-IN')}`);
            console.log(`   Builder: ${prop.builderName}`);
            console.log(`   RERA Date: ${prop.reraDate.toLocaleDateString()}`);
            console.log(`   Contact: ${prop.contact}`);
        });

        console.log('\n✅ All sample data inserted successfully!');
        console.log(`\nCollection: ${housingProperty.collection.name}`);
        console.log('You can now test fetching this data from the frontend.\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inserting data:', error);
        process.exit(1);
    }
}

insertSampleData();
