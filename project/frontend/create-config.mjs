import fs from 'fs';

const firebaseConfigFilePath = './frontend/firebaseConfig.js';
const razorpayConfigFilePath = './frontend/razorpayConfig.js';

// 1) Firebase config
const firebaseConfigContent = `
export const firebaseConfig = {
  apiKey: "${process.env.PUBLIC_FIREBASE_API_KEY || 'AIzaSyArmp7LtzuH4GKXUX9xKKMgaMHV1ioSeKU'}",
  authDomain: "${process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || 'realestate-ba037.firebaseapp.com'}",
  projectId: "${process.env.PUBLIC_FIREBASE_PROJECT_ID || 'realestate-ba037'}",
  storageBucket: "${process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || 'realestate-ba037.firebasestorage.app'}",
  messagingSenderId: "${process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1014619180710'}",
  appId: "${process.env.PUBLIC_FIREBASE_APP_ID || '1:1014619180710:web:49f231abc721762a472e67'}",
  measurementId: "${process.env.PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-YS2N7C27EC'}"
};
`;

fs.writeFileSync(firebaseConfigFilePath, firebaseConfigContent);
console.log('✅ Successfully created firebaseConfig.js for deployment inside /frontend!');

// 2) Razorpay config
const razorpayConfigContent = `
export const RAZORPAY_KEY_ID = "${process.env.PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_RgRWePe2MbrzTo'}";
`;

fs.writeFileSync(razorpayConfigFilePath, razorpayConfigContent);
console.log('✅ Successfully created razorpayConfig.js for deployment inside /frontend!');
