import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

async function testRazorpay() {
    console.log('🧪 Testing Razorpay Order Creation\n');

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    console.log('Key ID:', key_id);
    // console.log('Key Secret:', key_secret);

    if (!key_id || !key_secret) {
        console.error('❌ Razorpay keys missing in .env');
        return;
    }

    const razorpay = new Razorpay({
        key_id,
        key_secret
    });

    try {
        const options = {
            amount: 100, // 1 INR in paise
            currency: 'INR',
            receipt: `test_${Date.now()}`
        };

        console.log('Creating order with options:', options);
        const order = await razorpay.orders.create(options);
        console.log('\n✅ Order Created Successfully!');
        console.log(JSON.stringify(order, null, 2));

    } catch (error) {
        console.error('\n❌ Error creating Razorpay order:');
        console.error(error);
    }
}

testRazorpay();
