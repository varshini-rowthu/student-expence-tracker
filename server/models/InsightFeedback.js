import mongoose from 'mongoose';

const insightFeedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    insight_id: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      enum: ['not_useful', 'incorrect', 'already_known', 'other'],
      required: true,
    },
    insight_category: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const InsightFeedback = mongoose.models.InsightFeedback || mongoose.model('InsightFeedback', insightFeedbackSchema);
export default InsightFeedback;
