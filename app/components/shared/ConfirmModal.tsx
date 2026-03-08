import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#22263A',
              borderRadius: 16,
              padding: '28px',
              maxWidth: 420,
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#EF4444', flexShrink: 0,
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</h3>
                <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.5 }}>{description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onCancel}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '9px 18px',
                  color: '#64748B', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                style={{
                  background: '#EF4444', border: 'none', borderRadius: 8,
                  padding: '9px 18px', color: 'white', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
