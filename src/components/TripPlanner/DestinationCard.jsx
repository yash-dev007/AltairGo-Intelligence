import React, { memo } from 'react';
import { Check, Star, Users, ExternalLink } from 'lucide-react';
import styles from '../../pages/TripPlanner.module.css';

const DestinationCard = memo(({ dest, isSelected, onToggle }) => {
    return (
        <div
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            onClick={() => onToggle(dest.id)}
        >
            <div style={{ position: 'relative' }}>
                <img src={dest.image} alt={dest.name} className={styles.cardImage} loading="lazy" />
                {isSelected && <div className={styles.checkIcon}><Check size={16} /></div>}
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating}
                </div>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.tagsRow}>
                    <span className={styles.tagBadge}>{dest.tag}</span>
                    <span className={styles.crowdBadge} data-level={dest.crowdLevel}>
                        <Users size={12} strokeWidth={2.5} />
                        {dest.crowdLevel === 'High' ? 'Busy (Book Ahead)' : dest.crowdLevel === 'Low' ? 'Quiet & Relaxing' : 'Moderate Crowd'}
                    </span>
                </div>
                <div className={styles.cardTitle}>{dest.name}</div>
                <div className={styles.cardDesc} style={{ marginBottom: '1rem' }}>
                    {dest.desc}
                </div>
                {/* View Details Button that stops propagation to prevent selection toggle when clicked */}
                <a
                    href={`/destinations/${dest.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewDetailsBtn}
                    onClick={(e) => e.stopPropagation()}
                >
                    View Details <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
});

export default DestinationCard;
