import React from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ text }) => (
  <span className={styles.tooltip}>
    ⓘ
    <span className={styles.tooltipText}>{text}</span>
  </span>
);

export default Tooltip;