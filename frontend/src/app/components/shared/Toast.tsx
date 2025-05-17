"use client";
import { useEffect, useState } from 'react';
import styles from '../../page.module.css';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation before removing
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);
  
  const getToastClass = () => {
    const baseClass = `${styles.toast} ${isVisible ? styles.toastVisible : styles.toastHidden}`;
    
    switch (type) {
      case 'success':
        return `${baseClass} ${styles.toastSuccess}`;
      case 'error':
        return `${baseClass} ${styles.toastError}`;
      case 'warning':
        return `${baseClass} ${styles.toastWarning}`;
      default:
        return `${baseClass} ${styles.toastInfo}`;
    }
  };
  
  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'i';
    }
  };
  
  return (
    <div className={getToastClass()}>
      <div className={styles.toastIcon}>{getToastIcon()}</div>
      <div className={styles.toastMessage}>{message}</div>
      <button className={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
} 