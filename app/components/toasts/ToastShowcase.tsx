import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../../store/ToastContext';

const DEMOS = [
  { label: '✅ Success', color: '#22C55E', action: 'success' },
  { label: '🎉 Celebration', color: '#6C63FF', action: 'celebration' },
  { label: '💬 Comment', color: '#38BDF8', action: 'comment' },
  { label: '👍 Vote', color: '#A78BFA', action: 'vote' },
  { label: '❌ Error', color: '#EF4444', action: 'error' },
  { label: '⚠️ Warning', color: '#F59E0B', action: 'warning' },
  { label: '📁 Upload', color: '#6C63FF', action: 'upload' },
];

export function ToastShowcase() {
  const [open, setOpen] = useState(false);
  const { showSuccess, showCelebration, showComment, showVote, showError, showWarning, showUpload, upgradeToSuccess } = useToast();

  const trigger = (action: string) => {
    switch (action) {
      case 'success': return showSuccess('Post Published!', 'Your post is now live on the feed.');
      case 'celebration': return showCelebration('DevCraft');
      case 'comment': return showComment();
      case 'vote': return showVote();
      case 'error': return showError('Please try again or check your connection.');
      case 'warning': return showWarning('Action Required', 'You need to be logged in to vote.');
      case 'upload': {
        const id = showUpload('design-assets.zip');
        setTimeout(() => upgradeToSuccess(id), 2500);
        return;
      }
    }
  };

  return (
    <div style={{
      background: '#1A1D27', borderRadius: 12, padding: '14px 18px',
      border: '1px solid rgba(108,99,255,0.2)',
      boxShadow: '0 0 20px rgba(108,99,255,0.08)',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(108,99,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={14} color="#6C63FF" />
          </div>
          <div>
            <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>Toast Notification Demo</p>
            <p style={{ color: '#64748B', fontSize: 11 }}>Try all 7 toast variants</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DEMOS.map(({ label, color, action }) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => trigger(action)}
                  style={{
                    background: `${color}12`,
                    border: `1px solid ${color}40`,
                    borderRadius: 8, padding: '7px 12px',
                    color: color, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
