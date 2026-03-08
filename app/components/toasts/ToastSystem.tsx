import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast, Toast, ToastVariant } from '../../store/ToastContext';
import {
  CheckCircle2, X, MessageCircle, TrendingUp, AlertTriangle,
  AlertCircle, Crown, Upload, FileCheck
} from 'lucide-react';

function ProgressBar({ duration, color }: { duration: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setWidth(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [duration]);
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-xl overflow-hidden">
      <motion.div
        className="h-full rounded-b-xl"
        style={{ backgroundColor: color, width: `${width}%` }}
        transition={{ ease: 'linear' }}
      />
    </div>
  );
}

function ConfettiParticle({ color, angle }: { color: string; angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * 50;
  const ty = Math.sin(rad) * 50;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, top: '50%', left: '50%', originX: '50%', originY: '50%' }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    />
  );
}

const TOAST_CONFIGS: Record<ToastVariant, {
  borderColor: string; iconBg: string; progressColor: string; icon: React.ReactNode;
}> = {
  success: {
    borderColor: '#22C55E', iconBg: 'rgba(34,197,94,0.15)', progressColor: '#22C55E',
    icon: <CheckCircle2 size={20} color="#22C55E" />,
  },
  celebration: {
    borderColor: '#6C63FF', iconBg: 'rgba(108,99,255,0.15)', progressColor: '#6C63FF',
    icon: <Crown size={20} color="#6C63FF" />,
  },
  comment: {
    borderColor: '#38BDF8', iconBg: 'rgba(56,189,248,0.15)', progressColor: '#38BDF8',
    icon: <MessageCircle size={20} color="#38BDF8" />,
  },
  vote: {
    borderColor: '#A78BFA', iconBg: 'rgba(167,139,250,0.15)', progressColor: '#A78BFA',
    icon: <TrendingUp size={20} color="#A78BFA" />,
  },
  error: {
    borderColor: '#EF4444', iconBg: 'rgba(239,68,68,0.15)', progressColor: '#EF4444',
    icon: <AlertCircle size={20} color="#EF4444" />,
  },
  warning: {
    borderColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)', progressColor: '#F59E0B',
    icon: <AlertTriangle size={20} color="#F59E0B" />,
  },
  upload: {
    borderColor: '#6C63FF', iconBg: 'rgba(108,99,255,0.15)', progressColor: '#6C63FF',
    icon: <Upload size={20} color="#6C63FF" />,
  },
};

function UploadSpinner({ color }: { color: string }) {
  return (
    <motion.div
      className="w-5 h-5 rounded-full border-2 border-t-transparent"
      style={{ borderColor: `${color} transparent ${color} ${color}` }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const config = TOAST_CONFIGS[toast.variant];
  const isUpload = toast.variant === 'upload';
  const isError = toast.variant === 'error';
  const isVote = toast.variant === 'vote';
  const isCelebration = toast.variant === 'celebration';

  const shakeVariants = {
    initial: { x: 0 },
    animate: isError ? {
      x: [0, -8, 8, -8, 8, -4, 4, 0],
      transition: { duration: 0.5, times: [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1] }
    } : { x: 0 },
  };

  return (
    <motion.div
      layout
      initial={{ x: 400, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
      style={{
        background: '#1A1D27',
        borderLeft: `4px solid ${isUpload
          ? 'transparent'
          : config.borderColor}`,
        borderLeftStyle: isUpload ? 'solid' : 'solid',
        position: 'relative',
        minWidth: '320px',
        maxWidth: '380px',
        borderRadius: '12px',
        padding: isVote ? '12px 16px' : '16px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px ${config.borderColor}20`,
        overflow: 'hidden',
        ...(isUpload ? {
          borderImage: 'linear-gradient(135deg, #6C63FF, #38BDF8) 1',
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid',
          borderImage: `linear-gradient(180deg, #6C63FF, #38BDF8) 1`,
        } : {}),
      }}
    >
      <motion.div variants={shakeVariants} initial="initial" animate="animate">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className="shrink-0 flex items-center justify-center rounded-full w-9 h-9 relative"
            style={{ background: config.iconBg }}
            animate={isError ? {
              boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 12px rgba(239,68,68,0.5)', '0 0 0px rgba(239,68,68,0)'],
            } : isCelebration ? {
              rotate: [0, -10, 10, -10, 10, 0],
            } : toast.variant === 'comment' ? {
              y: [0, -3, 0],
            } : toast.variant === 'vote' ? {
              y: [0, -4, 0],
            } : toast.variant === 'success' ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={
              isError ? { repeat: 2, duration: 1 } :
              isCelebration ? { duration: 0.5 } :
              toast.variant === 'comment' ? { duration: 0.4, ease: 'easeOut' } :
              toast.variant === 'vote' ? { duration: 0.3, type: 'spring', stiffness: 400 } :
              toast.variant === 'success' ? { duration: 0.4, ease: 'easeOut' } :
              {}
            }
          >
            {isUpload ? <UploadSpinner color="#6C63FF" /> : config.icon}

            {/* Confetti for celebration */}
            {isCelebration && (
              <>
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <ConfettiParticle key={i} color={['#6C63FF', '#22C55E', '#38BDF8', '#F59E0B', '#EF4444', '#A78BFA'][i]} angle={angle} />
                ))}
              </>
            )}

            {/* Pulse for success */}
            {toast.variant === 'success' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid #22C55E' }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p style={{ color: '#F1F5F9', fontWeight: 600, fontSize: '14px', marginBottom: isVote ? 0 : '2px' }}>
              {toast.title}
            </p>
            {toast.subtitle && !isVote && (
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.4 }}>{toast.subtitle}</p>
            )}

            {/* Warning action buttons */}
            {toast.variant === 'warning' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    border: `1px solid #F59E0B`, color: '#F59E0B', background: 'transparent',
                    borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: 'transparent', color: '#64748B', border: 'none',
                    borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          {(isError || toast.variant === 'warning') && (
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748B' }}
            >
              <X size={16} />
            </button>
          )}
          {!isError && toast.variant !== 'warning' && (
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748B', opacity: 0.5 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Progress bar */}
      {!isError && !isUpload && toast.autoDismiss && toast.duration && (
        <ProgressBar duration={toast.duration} color={config.progressColor} />
      )}

      {/* Upload gradient border effect */}
      {isUpload && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{ border: '1px solid transparent', borderLeft: 'none' }}
          animate={{
            background: ['linear-gradient(#1A1D27,#1A1D27) padding-box, linear-gradient(135deg,#6C63FF,#38BDF8) border-box',
              'linear-gradient(#1A1D27,#1A1D27) padding-box, linear-gradient(225deg,#6C63FF,#38BDF8) border-box'],
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

export function ToastSystem() {
  const { toasts } = useToast();

  return (
    <div
      style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px',
        alignItems: 'flex-end', pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
