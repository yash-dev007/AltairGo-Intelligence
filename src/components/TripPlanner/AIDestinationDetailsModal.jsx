import React, { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, Star, Calendar, DollarSign, Camera, Info, Check, ArrowRight, Train, Plane } from 'lucide-react';
import { TripAI } from '../../services/TripAI';
import styles from './AIDestinationDetailsModal.module.css';

const AIDestinationDetailsModal = ({ isOpen, onClose, destination, onAddToTrip }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && destination) {
            fetchDetails();
        } else {
            setDetails(null);
            setError(null);
        }
    }, [isOpen, destination]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch updated details which now include attractions, tips etc.
            const data = await TripAI.getDestinationDetails(destination.name);
            if (data && !data.error) {
                setDetails(data);
            } else {
                setError("Could not fetch full details.");
            }
        } catch (err) {
            setError("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !destination) return null;

    // Use fetched details or fallback to basic props
    const displayImage = details?.image || destination.image;
    const displayName = destination.name;
    const location = destination.location || (details?.country ? `${details.country}` : '');

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                {/* Hero Section */}
                <div className={styles.hero}>
                    <img src={displayImage} alt={displayName} className={styles.heroImage} />
                    <div className={styles.heroContent}>
                        <h2 className={styles.title}>{displayName}</h2>
                        <div className={styles.subtitle}><MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} /> {location}</div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.content} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <Sparkles className="animate-spin" size={32} style={{ color: '#3b82f6', marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
                            <p>Curating insider tips...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.content}>
                            {/* Main Column */}
                            <div>
                                {/* About */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}><Info size={18} /> About</div>
                                    <p className={styles.description}>
                                        {details?.description || destination.description || `Experience the magic of ${displayName}. A perfect destination for travelers seeking culture, adventure, and relaxation.`}
                                    </p>
                                </div>

                                {/* Top Attractions */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}><Camera size={18} /> Top Attractions</div>
                                    <div className={styles.attractionsList}>
                                        {/* Fallback attractions logic if array is empty */}
                                        {(details?.attractions && details.attractions.length > 0 ? details.attractions :
                                            ['Main City Center', 'Historic Old Town', 'Scenic Viewpoint', 'Local Market'].map((n, i) => ({ name: n, type: 'Sightseeing' }))
                                        ).slice(0, 4).map((att, idx) => (
                                            <div key={idx} className={styles.attractionItem}>
                                                <div className={styles.attractionImage}></div> {/* Placeholder for attraction image */}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#334155' }}>{att.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{att.type || 'Sightseeing'} • ⭐ 4.something</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' }}>
                                            See all attractions →
                                        </div>
                                    </div>
                                </div>

                                {/* Must Try Food */}
                                {details?.food && (
                                    <div className={styles.section}>
                                        <div className={styles.sectionTitle}><span style={{ fontSize: '1.2rem' }}>🍽️</span> Must-Try Food</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {details.food.map((f, i) => (
                                                <span key={i} style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem' }}>
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Column */}
                            <div>
                                {/* Quick Stats box */}
                                <div className={styles.section} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#0f172a' }}>⚡ Quick Stats</h4>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div className={styles.statLabel}>Cost per Day</div>
                                        <div className={styles.statValue}>₹{destination.estimatedCostPerDay || '3,000'}</div>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div className={styles.statLabel}>Ideal Duration</div>
                                        <div className={styles.statValue}>3-4 Days</div>
                                    </div>
                                    <div>
                                        <div className={styles.statLabel}>Best Time</div>
                                        <div className={styles.statValue}>{destination.bestTime || 'Oct - Mar'}</div>
                                    </div>
                                </div>

                                {/* Insider Tips */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}><Sparkles size={18} color="#eab308" /> Insider Tips</div>
                                    <div>
                                        {(details?.hidden_gems || ['Visit early morning to avoid crowds', 'Book tickets online to save time']).slice(0, 3).map((tip, i) => (
                                            <div key={i} className={styles.tipItem}>
                                                <Check size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '3px' }} />
                                                <span>{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Getting There */}
                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}><Train size={18} /> Getting There</div>
                                    <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Plane size={14} /> Nearest Airport: {details?.nearest_airport || 'Local Airport (20km)'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Train size={14} /> Train: Main Junction
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className={styles.actions}>
                            <button className={styles.secondaryBtn} onClick={onClose}>Close</button>
                            <button
                                className={styles.primaryBtn}
                                onClick={() => {
                                    if (onAddToTrip) onAddToTrip(destination);
                                    onClose();
                                }}
                            >
                                <Check size={18} style={{ display: 'inline', marginRight: '6px' }} /> Add to My Trip
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIDestinationDetailsModal;
