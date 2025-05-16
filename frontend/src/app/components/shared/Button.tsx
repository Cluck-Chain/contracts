import { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from '../../page.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'action' | 'submit' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  // 确定CSS类名
  const getButtonClass = () => {
    switch (variant) {
      case 'action':
        return styles.actionButton;
      case 'submit':
        return styles.submitButton;
      case 'danger':
        return `${styles.actionButton} ${styles.dangerButton}`;
      case 'secondary':
        return `${styles.actionButton} ${styles.secondaryButton}`;
      default:
        return styles.connectWalletButton;
    }
  };

  const buttonClass = `${getButtonClass()} ${className || ''}`;
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={buttonClass}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (loadingText || '加载中...') : children}
    </button>
  );
} 