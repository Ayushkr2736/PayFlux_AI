// ============================================
// PayFlux AI - User Model
// backend/src/models/User.js
// ============================================
// Stores user credentials and payment behavior metadata
// used by the intelligence engine for personalization.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // -- Core Fields --
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{6,14}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password by default in queries
    },

    // -- Payment Intelligence Metadata --
    // Aggregated stats updated after each payment, used by the rule engine.
    metadata: {
      totalTransactions: { type: Number, default: 0 },
      totalAmountSpent: { type: Number, default: 0 },    // in paise (INR smallest unit)
      avgTransactionAmount: { type: Number, default: 0 }, // in paise
      lastTransactionAt: { type: Date, default: null },
      preferredPaymentMethod: { type: String, default: null },
      // Risk profile computed by intelligence engine
      riskProfile: {
        type: String,
        enum: ['low', 'medium', 'high', 'unknown'],
        default: 'unknown',
      },
      // Payment categories the user frequently transacts in
      frequentCategories: [{ type: String }],
    },

    // -- Account Status --
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    toJSON: {
      // Remove sensitive fields when converting to JSON
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---- Indexes for query performance ----
// Note: email index is already created by unique:true in the schema
userSchema.index({ phone: 1 });

// ---- Pre-save Hook: Hash password ----
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on every save)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ---- Instance Method: Compare password ----
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---- Instance Method: Update payment metadata after a successful payment ----
userSchema.methods.updatePaymentMetadata = function (amount, method, category) {
  this.metadata.totalTransactions += 1;
  this.metadata.totalAmountSpent += amount;
  this.metadata.avgTransactionAmount = Math.round(
    this.metadata.totalAmountSpent / this.metadata.totalTransactions
  );
  this.metadata.lastTransactionAt = new Date();

  if (method) {
    this.metadata.preferredPaymentMethod = method;
  }
  if (category && !this.metadata.frequentCategories.includes(category)) {
    this.metadata.frequentCategories.push(category);
    // Keep only last 10 categories
    if (this.metadata.frequentCategories.length > 10) {
      this.metadata.frequentCategories = this.metadata.frequentCategories.slice(-10);
    }
  }

  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
