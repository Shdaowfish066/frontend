import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastVariant = 'success' | 'celebration' | 'comment' | 'vote' | 'error' | 'warning' | 'upload';

export type Toast = {
  id: string;
  variant: ToastVariant;
  title: string;
  subtitle?: string;
  communityName?: string;
  autoDismiss?: boolean;
  duration?: number;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  showSuccess: (title: string, subtitle?: string) => void;
  showCelebration: (communityName: string) => void;
  showComment: () => void;
  showVote: () => void;
  showError: (subtitle?: string) => void;
  showWarning: (title?: string, subtitle?: string) => void;
  showUpload: (filename?: string) => string;
  upgradeToSuccess: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => {
      const next = [{ ...toast, id }, ...prev].slice(0, MAX_TOASTS);
      return next;
    });
    if (toast.autoDismiss !== false && toast.variant !== 'error') {
      const duration = toast.duration || 4000;
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration + 600);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, subtitle?: string) => {
    addToast({ variant: 'success', title, subtitle, autoDismiss: true, duration: 4000 });
  }, [addToast]);

  const showCelebration = useCallback((communityName: string) => {
    addToast({ variant: 'celebration', title: 'Community Created!', subtitle: `You're now the Captain of ${communityName}.`, communityName, autoDismiss: true, duration: 5000 });
  }, [addToast]);

  const showComment = useCallback(() => {
    addToast({ variant: 'comment', title: 'Comment Added', subtitle: 'Your comment was posted successfully.', autoDismiss: true, duration: 3500 });
  }, [addToast]);

  const showVote = useCallback(() => {
    addToast({ variant: 'vote', title: 'Vote Registered', autoDismiss: true, duration: 2500 });
  }, [addToast]);

  const showError = useCallback((subtitle?: string) => {
    addToast({ variant: 'error', title: 'Something went wrong', subtitle: subtitle || 'Please try again or check your connection.', autoDismiss: false });
  }, [addToast]);

  const showWarning = useCallback((title?: string, subtitle?: string) => {
    addToast({ variant: 'warning', title: title || 'Action Required', subtitle: subtitle || 'You need to be logged in to vote.', autoDismiss: true, duration: 6000 });
  }, [addToast]);

  const showUpload = useCallback((filename?: string): string => {
    return addToast({ variant: 'upload', title: 'Uploading file…', subtitle: filename ? `${filename} — please wait` : 'please wait', autoDismiss: false });
  }, [addToast]);

  const upgradeToSuccess = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? {
      ...t, variant: 'success' as ToastVariant, title: 'Upload Complete!', subtitle: 'Your file was uploaded successfully.', autoDismiss: true, duration: 3000,
    } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showSuccess, showCelebration, showComment, showVote, showError, showWarning, showUpload, upgradeToSuccess }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}