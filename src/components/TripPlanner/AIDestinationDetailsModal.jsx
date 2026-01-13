import React, { useState, useEffect } from 'react';
import { X, Sparkles, Utensils, MapPin, Star, Calendar } from 'lucide-react';
import { TripAI } from '../../services/TripAI';
import styles from './DateSelectionModal.module.css'; // Reusing modal styles

const AIDestinationDetailsModal = ({ isOpen, onClose, destination }) => {
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
            const data = await TripAI.getDestinationDetails(destination.name);
            if (data && !data.error) {
                setDetails(data);
            } else {
                setError("Could not fetch local insights.");
            }
        } catch (err) {
            setError("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !destination) return null;

    return (
        <div className={styles.overlay} style={{ zIndex: 2000 }}>
            <div className={styles.modal} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <button className={styles.closeBtn} onClick={onClose} style={{ zIndex: 10 }}>
                    <X size={20} />
                </button>

                <div style={{ position: 'relative', height: '200px', margin: '-1.5rem -1.5rem 1.5rem', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
                    <img
                        src={destination.image}
                        alt={destination.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '1.5rem' }}>
                        <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>{destination.name}</h2>
                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{destination.location || 'Explore'}</div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        <Sparkles className={styles.pulse} size={32} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                        <p>Asking local experts about the best spots...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                        <p>{error}</p>
                    </div>
                ) : details ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={18} fill="#3b82f6" stroke="none" /> What makes it special?
                            </h3>
                            <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>{details.special}</p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Utensils size={18} color="#f97316" /> Must-Try Food
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {details.food.map((item, i) => (
                                    <span key={i} style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #ffedd5' }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Star size={18} color="#eab308" /> Hidden Gems
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569' }}>
                                {details.hidden_gems.map((gem, i) => (
                                    <li key={i} style={{ marginBottom: '0.3rem' }}>{gem}</li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} /> Best For
                                </div>
                                <div style={{ color: '#15803d', fontSize: '0.9rem' }}>{details.best_for}</div>
                            </div>
                            <div style={{ background: '#fefce8', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#854d0e', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} /> Best Time & Pace
                                </div>
                                <div style={{ color: '#a16207', fontSize: '0.9rem' }}>{details.best_time_pace}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            💡 {details.culture}
                        </div>

                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AIDestinationDetailsModal;
