import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

async function testHousingAPI() {
    console.log('🧪 Testing Housing Properties API\n');

    // First, login to get a token
    console.log('1️⃣ Logging in...');
    try {
        const loginRes = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobileNumber: '+917021062721',
                password: 'admin@123'
            })
        });

        if (!loginRes.ok) {
            console.log('❌ Login failed');
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful\n');

        // Now fetch housing properties
        console.log('2️⃣ Fetching housing properties from /api/housing/all-public...');
        const propertiesRes = await fetch(`${API_BASE_URL}/api/housing/all-public`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            }
        });

        const propertiesData = await propertiesRes.json();

        if (propertiesRes.ok) {
            console.log('✅ API Response received\n');
            console.log('📊 Response Summary:');
            console.log(`   Status: ${propertiesRes.status}`);
            console.log(`   Message: ${propertiesData.message}`);
            console.log(`   Count: ${propertiesData.count}`);
            console.log(`   Properties in housingFlatsList: ${propertiesData.housingFlatsList?.length || 0}\n`);

            if (propertiesData.housingFlatsList && propertiesData.housingFlatsList.length > 0) {
                console.log('📋 Sample Property:');
                const sample = propertiesData.housingFlatsList[0];
                console.log(`   Project Name: ${sample.projectName}`);
                console.log(`   Location: ${sample.location}`);
                console.log(`   Area: ${sample.area}`);
                console.log(`   Type: ${sample.propertyType}`);
                console.log(`   Price: ${sample.price}`);
                console.log(`   Builder: ${sample.builderName}`);
                console.log(`   RERA Date: ${sample.reraDate}`);
                console.log(`   Contact: ${sample.contact}`);
                console.log(`   Date: ${sample.date}`);
            }

            console.log('\n✅ ALL TESTS PASSED! API is working correctly.');
            console.log('You can now search for properties in the frontend!');
        } else {
            console.log('❌ Failed to fetch properties');
            console.log('Response:', JSON.stringify(propertiesData, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

testHousingAPI();
