// backend/src/test_connections.js
const mongoose = require('mongoose');
const { getRazorpayClient } = require('./config/razorpay');
const { createOrder } = require('./services/paymentService');
const dotenv = require('dotenv');
const path = require('path');

// Load env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
  console.log('--- PayFlux AI Diagnostics ---');

  // 1. Test MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB: Connection Successful');
    await mongoose.connection.close();
  } catch (e) {
    console.error('❌ MongoDB: Connection Failed ->', e.message);
  }

  // 2. Test Razorpay
  try {
    const razorpay = getRazorpayClient();
    console.log('⏳ Razorpay: Attempting to create test order...');
    
    const order = await razorpay.orders.create({
      amount: 100, // 1 INR
      currency: "INR",
      receipt: "diag_rcpt_1"
    });

    console.log('✅ Razorpay: API Connection Successful');
    console.log('📄 Order ID:', order.id);
  } catch (e) {
    console.error('❌ Razorpay: API Authentication Failed ->', e.message);
    if (e.message.includes('rzp_test_xxxxxxxxxxxx')) {
      console.log('💡 TIP: You are still using the placeholder key in .env. Replace it with your actual key from the Razorpay dashboard.');
    }
  }

  process.exit();
}

verify();
