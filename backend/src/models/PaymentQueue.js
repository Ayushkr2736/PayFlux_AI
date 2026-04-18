// ============================================
// PayFlux AI - Payment Queue Model
// backend/src/models/PaymentQueue.js
// ============================================
// Offline-first queue — stores payments created while offline
// and manages their sync lifecycle with retry logic.

const mongoose = require('mongoose');

const paymentQueueSchema = new mongoose.Schema(
  {
    // -- Ownership --
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // -- Client-Generated Identifiers --
    localId: {
      type: String,
      required: [true, 'Local ID (client UUID) is required for deduplication'],
      unique: true,
      index: true,
    },

    // -- Payment Data (captured offline) --
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [100, 'Minimum amount is ₹1 (100 paise)'],
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
    notes: {
      type: Map,
      of: String,
      default: {},
    },

    // -- Queue Status --
    status: {
      type: String,
      enum: [
        'queued',      // Waiting to be processed
        'processing',  // Currently being synced to Razorpay
        'synced',      // Successfully created Razorpay order
        'failed',      // Failed after max retries
        'cancelled',   // Cancelled by user before sync
      ],
      default: 'queued',
      index: true,
    },

    // -- Sync Management --
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 5 },
    lastError: { type: String, default: null },

    // -- Linked Payment (once synced) --
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },

    // -- Timing --
    createdOfflineAt: {
      type: Date,
      required: [true, 'Offline creation timestamp is required'],
    },
    syncedAt: { type: Date, default: null },
    nextRetryAt: { type: Date, default: null },

    // -- Priority (for queue ordering) --
    priority: {
      type: Number,
      default: 0, // Higher = processed first
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---- Indexes ----
paymentQueueSchema.index({ status: 1, priority: -1, createdAt: 1 }); // Queue processing order
paymentQueueSchema.index({ userId: 1, status: 1 });                   // User's queue items
paymentQueueSchema.index({ nextRetryAt: 1 }, { sparse: true });       // Retry scheduler

// ---- Static: Get next batch of items to process ----
paymentQueueSchema.statics.getNextBatch = function (batchSize = 10) {
  const now = new Date();
  return this.find({
    status: { $in: ['queued', 'processing'] },
    $or: [
      { nextRetryAt: null },            // Never retried
      { nextRetryAt: { $lte: now } },   // Retry time has passed
    ],
    $expr: { $lt: ['$retryCount', '$maxRetries'] }, // Haven't exceeded max retries
  })
    .sort({ priority: -1, createdAt: 1 }) // High priority first, then FIFO
    .limit(batchSize);
};

// ---- Static: Get queue stats for a user ----
paymentQueueSchema.statics.getUserQueueStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  // Transform into a clean object
  const result = {
    queued: { count: 0, totalAmount: 0 },
    processing: { count: 0, totalAmount: 0 },
    synced: { count: 0, totalAmount: 0 },
    failed: { count: 0, totalAmount: 0 },
    cancelled: { count: 0, totalAmount: 0 },
  };

  stats.forEach((s) => {
    result[s._id] = { count: s.count, totalAmount: s.totalAmount };
  });

  return result;
};

// ---- Instance Method: Mark as processing ----
paymentQueueSchema.methods.markProcessing = function () {
  this.status = 'processing';
  return this.save();
};

// ---- Instance Method: Mark as synced ----
paymentQueueSchema.methods.markSynced = function (paymentId, razorpayOrderId) {
  this.status = 'synced';
  this.paymentId = paymentId;
  this.razorpayOrderId = razorpayOrderId;
  this.syncedAt = new Date();
  return this.save();
};

// ---- Instance Method: Mark as failed with retry scheduling ----
paymentQueueSchema.methods.markFailed = function (error, retryDelayMs = 3000) {
  this.retryCount += 1;
  this.lastError = error;

  if (this.retryCount >= this.maxRetries) {
    this.status = 'failed'; // Permanently failed
  } else {
    this.status = 'queued'; // Back to queue for retry
    // Exponential backoff: delay * 2^retryCount
    const backoffMs = retryDelayMs * Math.pow(2, this.retryCount);
    this.nextRetryAt = new Date(Date.now() + backoffMs);
  }

  return this.save();
};

const PaymentQueue = mongoose.model('PaymentQueue', paymentQueueSchema);

module.exports = PaymentQueue;
