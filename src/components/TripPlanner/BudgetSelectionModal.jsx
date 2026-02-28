import React, { useState } from 'react';
import { X, DollarSign, Clock, Compass, Check, ArrowRight } from 'lucide-react';
import styles from './BudgetSelectionModal.module.css';

const BudgetSelectionModal = ({ isOpen, onClose, onApply }) => {
    const [budget, setBudget] = useState(50000);
    const [style, setStyle] = useState('Standard'); // Budget, Standard, Luxury

    if (!isOpen) return null;

    const TRAVEL_STYLES = [
        { id: 'Budget', label: 'Budget-Friendly', desc: 'Hostels, street food, public transit', icon: '🎒' },
        { id: 'Standard', label: 'Balanced Comfort', desc: 'Good hotels, mix of dining & fun', icon: '⚖️' },
        { id: 'Luxury', label: 'Premium Experience', desc: 'Top resorts, fine dining, private transfers', icon: '💎' }
    ];

    const handleSubmit = () => {
        onApply({ budget, style });
        onClose();
    };

    // Format currency for display
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className={styles.modalTitle}>Trip Preferences</h2>
                <p className={styles.modalSubtitle}>
                    Customize your experience to get the best AI recommendations.
                </p>

                {/* Budget Section */}
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>
                        <DollarSign size={16} strokeWidth={2.5} /> Total Budget
                    </div>
                    <div className={styles.inputGroup}>
                        <span style={{ color: '#64748b', fontWeight: 'bold' }}>₹</span>
                        <input
                            type="number"
                            min="5000" step="1000"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className={styles.numInput}
                        />
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            (Approx. {formatCurrency(budget)})
                        </span>
                    </div>
                </div>

                {/* Travel Style Section */}
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>
                        <Compass size={16} strokeWidth={2.5} /> Travel Style
                    </div>
                    <div className={styles.styleGrid}>
                        {TRAVEL_STYLES.map(s => (
                            <div
                                key={s.id}
                                className={`${styles.styleCard} ${style === s.id ? styles.selected : ''}`}
                                onClick={() => setStyle(s.id)}
                            >
                                <span className={styles.styleIcon}>{s.icon}</span>
                                <span className={styles.styleLabel}>{s.label}</span>
                                <span className={styles.styleDesc}>{s.desc}</span>
                                {style === s.id && (
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#3b82f6' }}>
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.applyBtn} onClick={handleSubmit}>
                        Save Preferences <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetSelectionModal;

