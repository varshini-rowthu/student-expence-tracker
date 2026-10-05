import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';

const REASONS = [
  { id: 'not_useful', label: 'Not useful for me', description: 'This recommendation does not fit my financial situation' },
  { id: 'incorrect', label: 'Incorrect or inaccurate', description: 'The calculation or assumption seems wrong' },
  { id: 'already_known', label: 'Already known', description: 'I am already aware of this spending pattern' },
  { id: 'other', label: 'Other reason', description: 'Dismiss without specific categorization' },
];

const FeedbackModal = ({ isOpen, onClose, insight, onDismissConfirmed }) => {
  const { showToast } = useAuth();
  const [selectedReason, setSelectedReason] = useState('not_useful');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !insight) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await aiService.submitDismissalFeedback(
        insight.id,
        selectedReason,
        insight.category
      );
      showToast('Feedback noted! AI suggestions will adapt accordingly.', 'success');
      onDismissConfirmed(insight.id);
      onClose();
    } catch (err) {
      showToast('Dismissed insight', 'info');
      onDismissConfirmed(insight.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700/80 bg-[#111827] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Dismiss AI Insight</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4">
          <p className="text-xs text-gray-400 mb-3">
            Please tell us why you are dismissing <strong className="text-gray-200">"{insight.title}"</strong> so our adaptive learning engine avoids repeating similar suggestions:
          </p>

          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReason === r.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedReason === r.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600'
                }`}>
                  {selectedReason === r.id && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-[11px] text-gray-400">{r.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            {submitting ? 'Submitting...' : 'Confirm Dismissal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
