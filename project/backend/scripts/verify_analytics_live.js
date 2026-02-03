import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';
const JWT_SECRET = 'ab0014c72c14587f6e797fd1aeb46c718d9a5bc28e85029b80eb237206ac8f5b8859fdd0b927c0d7c0ed32de2e304c5c9975b9847ba874f1a918f0af8ca37cf4';
const USER_ID = '697885d300af77679c32d61d';
const USER_MOBILE = '917021062721';
const OWNER_CONTACT = '7499455975'; // As per user request (no 91 prefix in their request text, but might appear in DB)

// 1. Generate Token
const token = jwt.sign(
    { userId: USER_ID, mobileNumber: USER_MOBILE },
    JWT_SECRET,
    { expiresIn: '1h' }
);
console.log('✅ Generated Token');

async function verifyFlow() {
    try {
        console.log('\n--- 1. Fetching Property ---');
        // We need to find the property ID for the Malad West property with this contact
        // Assuming we can search or list all
        const allPropsRes = await fetch(`${API_BASE_URL}/api/housing/all-public`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allPropsData = await allPropsRes.json();

        const targetProperty = allPropsData.housingFlatsList.find(p =>
            p.location.includes('Malad West') &&
            (p.contact.includes(OWNER_CONTACT) || p.contact.includes('91' + OWNER_CONTACT))
        );

        if (!targetProperty) {
            console.error('❌ Could not find the Malad West property with contact', OWNER_CONTACT);
            console.log('Available properties:', allPropsData.housingFlatsList.map(p => ({ loc: p.location, con: p.contact })));
            return;
        }
        console.log(`✅ Found Property: ${targetProperty.id} (${targetProperty.location}, ${targetProperty.contact})`);

        console.log('\n--- 2. Sending Interest (POST) ---');
        // Sending '4 BHK' as type to test the validation fix
        const payload = {
            propertyOwnerContact: targetProperty.contact, // e.g. 917499455975
            propertyDetails: {
                id: targetProperty.id,
                type: '4 BHK', // INVALID TYPE - Expecting backend to handle it
                location: targetProperty.location,
                price: targetProperty.price
            }
        };

        const postRes = await fetch(`${API_BASE_URL}/api/housing/send-interest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const postData = await postRes.json();
        console.log('POST Response:', postData);

        if (!postRes.ok) {
            console.error('❌ POST failed');
            return;
        }

        console.log('\n--- 3. Fetching Analytics (GET) ---');
        const analyticsRes = await fetch(`${API_BASE_URL}/api/analytics/user/${USER_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const analyticsData = await analyticsRes.json();

        // Debug output
        // console.log('Analytics Data:', JSON.stringify(analyticsData, null, 2));

        if (analyticsData.status === 'success') {
            const leads = analyticsData.data.leads;
            console.log(`Leads found: ${leads.length}`);

            // Check if our property is in the top leads (most recent)
            const recentLead = leads[0];
            if (recentLead && recentLead.propertyId === targetProperty.id) {
                console.log('✅ SUCCESS: New lead found at top of list!');
                console.log('Lead Details:', {
                    type: recentLead.propertyType,
                    contact: recentLead.ownerContact,
                    date: recentLead.clickedAt
                });
            } else {
                console.error('❌ FAILURE: New lead NOT found at top.');
                console.log('Top lead was:', recentLead);
            }
        } else {
            console.error('❌ Analytics Fetch Failed:', analyticsData);
        }


    } catch (err) {
        console.error('❌ Error:', err);
    }
}

verifyFlow();
