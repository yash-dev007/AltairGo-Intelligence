import React from 'react';
import { Plane, Building, Ticket, ArrowRight, ExternalLink } from 'lucide-react';
import styles from './AIDestinationDetailsModal.module.css'; // Reusing glassmorphism styles

const BookingSection = ({ startLocation, destinations, travelDate }) => {
    // Helper to generate search links using our backend Affiliate Tracker
    const getFlightLink = (dest) => {
        return `/api/book/flight?destination=${encodeURIComponent(dest)}&partner=makemytrip`;
    };

    const getHotelLink = (city) => {
        return `/api/book/hotel?destination=${encodeURIComponent(city)}&partner=booking`;
    };

    const firstDest = destinations && destinations.length > 0 ? destinations[0].name : 'Destination';

    return (
        <div style={{ marginTop: '4rem', padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1e293b' }}>Ready to Book? ✈️</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Secure your flights and stays to lock in the best rates.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Flights Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                    padding: '1.5rem', borderRadius: '20px', border: '1px solid #dbeafe',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ background: '#bfdbfe', padding: '10px', borderRadius: '12px' }}>
                            <Plane size={24} color="#1d4ed8" />
                        </div>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            From ₹3,500
                        </span>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#1e3a8a' }}>Book Flights</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {startLocation || 'Your City'} <ArrowRight size={14} style={{ display: 'inline' }} /> {firstDest}
                        </div>
                    </div>
                    <a
                        href={getFlightLink(firstDest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            marginTop: 'auto', textAlign: 'center', background: '#2563eb', color: 'white',
                            padding: '0.75rem', borderRadius: '12px', fontWeight: '600', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                        }}
                    >
                        Search on MakeMyTrip <ExternalLink size={16} />
                    </a>
                </div>

                {/* Hotels Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                    padding: '1.5rem', borderRadius: '20px', border: '1px solid #dcfce7',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ background: '#bbf7d0', padding: '10px', borderRadius: '12px' }}>
                            <Building size={24} color="#15803d" />
                        </div>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                            Best Rated
                        </span>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#14532d' }}>Book Stays</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Top rated hotels in {destinations?.length > 1 ? 'your destinations' : firstDest}
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {destinations?.slice(0, 2).map((dest, i) => (
                            <a
                                key={i}
                                href={getHotelLink(dest.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.6rem 1rem', background: 'white', borderRadius: '10px',
                                    border: '1px solid #e2e8f0', color: '#334155', textDecoration: 'none', fontSize: '0.9rem'
                                }}
                            >
                                Stay in {dest.name} <ExternalLink size={14} color="#94a3b8" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Activities Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                    padding: '1.5rem', borderRadius: '20px', border: '1px solid #ffedd5',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ background: '#fed7aa', padding: '10px', borderRadius: '12px' }}>
                            <Ticket size={24} color="#c2410c" />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', color: '#7c2d12' }}>Experience It</h3>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Skip the line tickets & tours
                        </div>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#334155', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Local City Tours <span style={{ color: '#f97316', fontWeight: 'bold' }}>Book</span>
                        </div>
                        <div style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#334155', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Monument Entry <span style={{ color: '#f97316', fontWeight: 'bold' }}>Book</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSection;
