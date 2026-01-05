
import React from 'react';
import { Clock, MapPin, Navigation, Camera, Coffee, Sun, Moon, Info } from 'lucide-react';

const ItineraryTimeline = ({ itinerary }) => {
    if (!itinerary || itinerary.length === 0) return null;

    // Group by Day
    const days = [...new Set(itinerary.map(item => item.day))].sort((a, b) => a - b);

    return (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {days.map(dayNum => {
                const dayItems = itinerary.filter(i => i.day === dayNum);
                const dayTitle = `Day ${dayNum}`; // Could be enhanced with date if available

                return (
                    <div key={dayNum} className="timeline-day">
                        {/* Day Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                background: 'var(--primary)', color: 'white',
                                fontWeight: 'bold', padding: '0.5rem 1.5rem',
                                borderRadius: '12px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                            }}>
                                {dayTitle}
                            </div>
                            <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
                        </div>

                        {/* Timeline Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0', marginLeft: '1rem' }}>
                            {dayItems.map((item, idx) => (
                                <div key={idx} style={{
                                    position: 'relative',
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {/* Timeline Dot */}
                                    <div style={{
                                        position: 'absolute', left: '-25px', top: '20px',
                                        width: '16px', height: '16px',
                                        background: 'white', border: '4px solid var(--primary)',
                                        borderRadius: '50%'
                                    }}></div>

                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                        {/* Image (if available) */}
                                        {item.image && (
                                            <div style={{ flex: '0 0 120px' }}>
                                                <img
                                                    src={item.image}
                                                    alt={item.location}
                                                    style={{
                                                        width: '120px', height: '120px',
                                                        objectFit: 'cover', borderRadius: '12px'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                                                    {item.location}
                                                </h3>
                                                {item.time && (
                                                    <span style={{
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        fontSize: '0.85rem', color: '#64748b',
                                                        background: '#f8fafc', padding: '4px 8px', borderRadius: '6px'
                                                    }}>
                                                        <Clock size={14} /> {item.time}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                <MapPin size={16} /> {item.location}
                                            </div>

                                            <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                                {item.activities}
                                            </p>

                                            {/* Optional Tags/Icons based on content (simple heuristic) */}
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                                {item.activities?.toLowerCase().includes('food') && <Coffee size={18} color="#f59e0b" />}
                                                {item.activities?.toLowerCase().includes('view') && <Camera size={18} color="#3b82f6" />}
                                                {item.activities?.toLowerCase().includes('walk') && <Navigation size={18} color="#10b981" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ItineraryTimeline;
