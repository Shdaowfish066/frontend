import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { ErrorBoundary } from './ErrorBoundary';
import '../styles/fonts.css';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
