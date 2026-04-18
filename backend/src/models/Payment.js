// ============================================
// PayFlux AI - Payment Model
// backend/src/models/Payment.js
// ============================================
// Core payment record — tracks Razorpay transactions,
// offline sync status, and intelligence analysis results.

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // -- Ownership --
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // -- Razorpay Identifiers --
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    // -- Transaction Details --
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [100, 'Minimum amount is ₹1 (100 paise)'], // Razorpay minimum
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'bank_transfer', null],
      default: null,
    },

    // -- Payment Status --
    status: {
      type: String,
      enum: [
        'created',      // Order created, awaiting payment
        'authorized',   // Payment authorized, awaiting capture
        'captured',     // Payment successfully captured (money received)
        'failed',       // Payment failed
        'refunded',     // Payment refunded
        'expired',      // Order expired without payment
      ],
      default: 'created',
      index: true,
    },

    // -- Offline Sync Tracking --
    syncedFromOffline: {
      type: Boolean,
      default: false,
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentQueue',
      default: null,
    },
    localId: {
      type: String,
      default: null, // Client-generated UUID for offline deduplication
    },

    // -- Intelligence Analysis --
    // Populated by the intelligence engine after payment is processed
    intelligence: {
      // What the user was likely trying to do
      intentCategory: {
        type: String,
        enum: [
          'bill_payment',
          'subscription',
          'one_time_purchase',
          'recurring_transfer',
          'high_value_purchase',
          'micro_payment',
          'refund_request',
          'unknown',
        ],
        default: 'unknown',
      },
      // Risk score from 0 (safe) to 100 (suspicious)
      riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      // Risk level bucket
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
      },
      // Specific flags raised by the rule engine
      flags: [
        {
          rule: String,      // e.g., 'unusual_amount'
          message: String,   // e.g., 'Amount is 5x user average'
          severity: {
            type: String,
            enum: ['info', 'warning', 'critical'],
          },
        },
      ],
      // Processing suggestions
      suggestedAction: {
        type: String,
        enum: ['auto_approve', 'review', 'block', 'request_verification'],
        default: 'auto_approve',
      },
      analyzedAt: { type: Date, default: null },
    },

    // -- Metadata --
    notes: {
      type: Map,
      of: String,  // Key-value pairs (Razorpay notes format)
      default: {},
    },
    receipt: { type: String, default: null },
    failureReason: { type: String, default: null },
    refundedAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.razorpaySignature; // Don't expose signature in API responses
        return ret;
      },
    },
  }
);

// ---- Compound Indexes ----
paymentSchema.index({ userId: 1, createdAt: -1 }); // User's payment history
paymentSchema.index({ status: 1, createdAt: -1 });  // Filter by status
paymentSchema.index({ localId: 1 }, { sparse: true }); // Offline dedup

// ---- Virtual: amount in rupees (display helper) ----
paymentSchema.virtual('amountInRupees').get(function () {
  return (this.amount / 100).toFixed(2);
});

// ---- Static: Find payments needing intelligence analysis ----
paymentSchema.statics.findUnanalyzed = function (limit = 50) {
  return this.find({
    'intelligence.analyzedAt': null,
    status: { $in: ['captured', 'authorized'] },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
