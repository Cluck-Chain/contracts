import { ReactNode } from 'react';
import styles from '../../page.module.css';

interface DataItemProps {
  label: string;
  value: ReactNode;
}

export function DataItem({ label, value }: DataItemProps) {
  return (
    <div className={styles.dataRow}>
      <span className={styles.dataLabel}>{label}:</span>
      <span className={styles.dataValue}>{value}</span>
    </div>
  );
}

interface DataDisplayProps {
  title?: string;
  children: ReactNode;
}

export function DataDisplay({ title, children }: DataDisplayProps) {
  return (
    <div className={styles.dataSection}>
      {title && <h4>{title}</h4>}
      <div className={styles.dataGrid}>
        {children}
      </div>
    </div>
  );
} 