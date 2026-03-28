const API_BASE_URL = "https://project2-mj7h.onrender.com";

async function executeTest() {
    const testUser = {
        fullName: "Email Verification Bot",
        mobileNumber: "9911000088",
        password: "TestPassword123!",
        location: "Mumbai",
        userType: "Individual"
    };

    try {
        console.log("1. Registering test user...");
        const regRes = await fetch(`${API_BASE_URL}/api/users/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        console.log("Registration Status:", regRes.status, regData.message || regData.msg);

        if (regRes.status !== 201 && !regData.msg?.includes("already exists")) {
            throw new Error("Registration failed");
        }

        console.log("\n2. Logging in...");
        const loginRes = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mobileNumber: testUser.mobileNumber,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        console.log("Login Status:", loginRes.status);

        if (!loginRes.ok) {
            throw new Error("Login failed: " + (loginData.message || loginData.msg));
        }

        const token = loginData.token;
        console.log("✅ Token received.");

        console.log("\n3. Triggering Interest for Sahil's property...");
        // Using Property ID for Sahil's 'Workproof' project
        const interestBody = {
            propertyOwnerContact: "7499455975",
            propertyDetails: {
                id: "69c619cbbd27170b76257be9",
                type: "1 RK",
                location: "Andheri West",
                price: "100"
            }
        };

        const interestRes = await fetch(`${API_BASE_URL}/api/housing/send-interest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(interestBody)
        });

        const interestData = await interestRes.json();
        console.log("Interest Request Status:", interestRes.status);
        console.log("Response:", interestData.message || interestData.msg);

        if (interestRes.ok) {
            console.log("\n✅ SUCCESS: Interest triggered on LIVE server.");
            console.log("Email should be on its way to secondcount18@gmail.com.");
        } else {
            console.log("❌ FAILED to trigger interest.");
        }

    } catch (err) {
        console.error("Test execution failed:", err.message);
    }
}

executeTest();
