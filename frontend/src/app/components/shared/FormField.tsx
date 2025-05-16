import { InputHTMLAttributes } from 'react';
import styles from '../../page.module.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({
  label,
  id,
  error,
  ...rest
}: FormFieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.formLabel}>{label}</label>
      <input
        id={id}
        className={`${styles.formInput} ${error ? styles.inputError : ''}`}
        {...rest}
      />
      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
} 