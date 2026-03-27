
import axios from 'axios';

const testInterest = async () => {
    try {
        // We assume the server is running on port 3000
        const API_URL = 'http://localhost:3000/api/housing/send-interest';
        
        // We'll need a token. Since I can't easily get one without login, 
        // I'll just check if the backend logs "DEBUG: sendInterestSMS called"
        // and if it hits the builder lookup.
        
        console.log("Starting local interest test...");
        
        const response = await axios.post(API_URL, {
            propertyOwnerContact: '7021062721', // Sahil's or Admin's number
            propertyDetails: {
                id: 'test_id',
                type: 'rent',
                location: 'Mumbai',
                price: '₹20,000'
            }
        }, {
            headers: {
                'authorization': 'Bearer MOCK_TOKEN' // The backend will fail token verification but we can check the logs before that
            }
        });

        console.log("Response:", response.data);
    } catch (error) {
        console.log("Expected Error (Mock Token):", error.response ? error.response.status : error.message);
    }
};

testInterest();
