import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { API_BASE_URL } from '../../config';

// Simple modal styles inline for MVP speed
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalContentStyle = {
    background: 'white', padding: '1.5rem', borderRadius: '16px',
    width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto'
};

const ActivitySwapModal = ({ isOpen, onClose, originalActivity, onSwap }) => {
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAlternatives = async () => {
            setLoading(true);
            try {
                // Check if we have a real DB-backed activity or a generic text one
                // We'll try to extract location/type from the text or passed props
                const payload = {
                    location: originalActivity.location || "Jaipur", // Fallback for prototype
                    type: "Historic" // Fallback
                };

                const res = await fetch(`${API_BASE_URL}/api/activities/alternatives`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                setAlternatives(data);
            } catch (e) {
                console.error("Failed to swap", e);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && originalActivity) {
            fetchAlternatives();
        }
    }, [isOpen, originalActivity]);

    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Swap Activity</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#ffe4e6', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <div style={{ fontSize: '0.8rem', color: '#be123c', fontWeight: '600' }}>REPLACING</div>
                    <div style={{ fontWeight: '600' }}>{originalActivity?.activity || originalActivity?.name}</div>
                </div>

                <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', color: '#64748b' }}>AVAILABLE ALTERNATIVES</h4>

                {loading ? (
                    <div>Loading alternatives...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {alternatives.map(alt => (
                            <div key={alt.id} style={{ display: 'flex', gap: '1rem', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px' }}>
                                <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    {alt.image && <img src={alt.image} alt={alt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>{alt.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{alt.duration} • ₹{alt.entry_cost}</div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{alt.description?.substring(0, 60)}...</div>
                                </div>
                                <button
                                    onClick={() => onSwap(alt)}
                                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Swap
                                </button>
                            </div>
                        ))}
                        {alternatives.length === 0 && <div>No alternatives found.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivitySwapModal;
