import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    currency: {
      type: String,
      default: '$',
    },
    monthlyAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    defaultMonthlyBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    alertThresholdWarning: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
    },
    alertThresholdCritical: {
      type: Number,
      default: 100,
      min: 50,
      max: 200,
    },
    spendingCategories: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
