// Centralized API Configuration
let base = window.location.origin;

// If running on localhost/127.0.0.1 (e.g. via Live Server on port 5500), 
// but the backend is on 3000, we should point to 3000.
if (base.includes("localhost") || base.includes("127.0.0.1")) {
    if (!base.includes(":3000")) {
        base = "http://localhost:3000";
    }
}

// Production URL
export const API_BASE_URL = "https://project2-mj7h.onrender.com";

// Localhost URL (Commented out)
// export const API_BASE_URL = "http://localhost:3000";
