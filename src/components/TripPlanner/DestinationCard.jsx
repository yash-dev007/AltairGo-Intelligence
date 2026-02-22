import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Users, ExternalLink } from 'lucide-react';
import styles from '../../pages/trips/TripPlanner.module.css';

const DestinationCard = memo(({ dest, isSelected, onToggle, onViewDetails }) => {
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
                        {dest.crowdLevel === 'High' ? 'Busy' : dest.crowdLevel === 'Low' ? 'Quiet' : 'Moderate'}
                    </span>
                </div>
                <div className={styles.cardTitle}>{dest.name}</div>
                <div className={styles.cardDesc}>
                    {dest.desc}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {dest.estimated_cost_per_day ? `₹${dest.estimated_cost_per_day}/day` : '$$'}
                    </span>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {dest.best_time || 'Anytime'}
                    </span>
                </div>

                {onViewDetails ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(dest);
                        }}
                        className={styles.viewDetailsBtn}
                        style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', marginTop: '1rem', width: '100%' }}
                    >
                        View Details <ExternalLink size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                    </button>
                ) : (
                    <Link
                        to={`/destinations/${dest.id}`}
                        state={{ from: window.location.pathname + window.location.search }}
                        className={styles.viewDetailsBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', marginTop: '1rem', width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}
                    >
                        View Details <ExternalLink size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                    </Link>
                )}
            </div>
        </div>
    );
});

export default DestinationCard;
