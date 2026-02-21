import React from 'react';
import { Clock, MapPin, IndianRupee, ArrowRight, Sparkles, Camera, Map } from 'lucide-react';
import styles from '../../pages/trips/TripPlanner.module.css';

const TripOptions = ({ options, onSelectOption, onCustomize }) => {
    if (!options || options.length === 0) return null;

    return (
        <div style={{ padding: '0 0 4rem 0' }}>
            <h2 className={styles.title}>We found 3 perfect trips for you! ✨</h2>
            <p className={styles.subtitle}>Our AI has crafted these options based on your preferences. Choose your favorite.</p>

            <div className={styles.optionsGrid} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                {options.map((opt) => (
                    <div
                        key={opt.id || opt.title}
                        className={styles.card}
                        style={{
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s',
                            padding: 0
                        }}
                    >
                        <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                            <img
                                src={opt.image || 'https://images.unsplash.com/photo-1596727147705-5d46c1967a97'}
                                alt={opt.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#0f172a'
                            }}>
                                ₹{(opt.total_cost || 0).toLocaleString()}
                            </div>
                        </div>

                        <div className={styles.cardContent} style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                color: '#1e293b',
                                marginBottom: '0.5rem',
                                lineHeight: '1.3'
                            }}>
                                {opt.title}
                            </h3>

                            <p style={{
                                color: '#64748b',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                marginBottom: '1.5rem',
                                flex: 1
                            }}>
                                {opt.description || "An amazing journey tailored just for you."}
                            </p>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    color: '#94a3b8',
                                    fontWeight: '700',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.75rem'
                                }}>
                                    Trip Highlights
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {opt.highlights && opt.highlights.slice(0, 3).map((h, i) => (
                                        <span key={i} style={{
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>


                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                <button
                                    onClick={() => onSelectOption(opt)}
                                    className={styles.nextBtn}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        padding: '0.75rem'
                                    }}
                                >
                                    View Full Itinerary
                                </button>
                            </div>
                            <button
                                onClick={() => onCustomize(opt)}
                                style={{
                                    marginTop: '0.75rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Customize this plan
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripOptions;
