import fetch from 'node-fetch';

async function testInterest() {
    try {
        const response = await fetch('http://localhost:3000/api/commercial/send-interest', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWM1OGFjZGQzY2I4MTA3OWViNTA4MDQiLCJtb2JpbGVOdW1iZXIiOiI5MTcwMjEwNjI3MjEiLCJpYXQiOjE3NzQ1OTM3MjMsImV4cCI6MTc3NDYwMDkyM30.6t0o4au5PMxBHzewfgHCMrVU3-W0aCmD68d_6ktouEw'
            },
            body: JSON.stringify({
                propertyOwnerContact: "7499455975",
                propertyDetails: {
                    id: "69c619c1bd27170b76257bed",
                    type: "Commercial Shop",
                    location: "Test Location Clean",
                    price: "₹500"
                }
            })
        });
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
    }
}

testInterest();
