import { ReactNode } from 'react';
import styles from '../../page.module.css';

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className={styles.sectionCard}>
      <h4>{title}</h4>
      {children}
    </div>
  );
} 