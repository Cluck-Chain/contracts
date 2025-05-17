"use client";
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastType } from '../components/shared/Toast';
import styles from '../page.module.css';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const showSuccess = useCallback((message: string) => {
    addToast(message, 'success');
  }, [addToast]);
  
  const showError = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);
  
  const showWarning = useCallback((message: string) => {
    addToast(message, 'warning');
  }, [addToast]);
  
  const showInfo = useCallback((message: string) => {
    addToast(message, 'info');
  }, [addToast]);
  
  return (
    <ToastContext.Provider 
      value={{ 
        showToast: addToast, 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo 
      }}
    >
      {children}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 