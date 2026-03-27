// Centralized API Configuration
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const PROD_URL = "https://project2-mj7h.onrender.com";
const LOCAL_URL = "http://localhost:3000";

export const API_BASE_URL = isLocal ? LOCAL_URL : PROD_URL;

console.log("DSA BUILDER: API Base URL set to", API_BASE_URL);
