import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null represents overall monthly budget
    },
    category_name: {
      type: String,
      default: 'Overall Budget',
    },
    month: {
      type: String, // Format: YYYY-MM
      required: [true, 'Month in YYYY-MM format is required'],
      index: true,
    },
    limit_amount: {
      type: Number,
      required: [true, 'Budget limit amount is required'],
      min: [1, 'Budget limit must be at least 1'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Ensure a user can only have one budget per category per month
budgetSchema.index({ user_id: 1, category_id: 1, month: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export default Budget;
