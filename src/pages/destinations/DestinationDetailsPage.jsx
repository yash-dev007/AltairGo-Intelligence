import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, MapPin, Info, Camera, Sparkles, Check, Train, Plane, ArrowLeft, Star } from 'lucide-react';
import { TripAI } from '../../services/TripAI';
import styles from '../../components/TripPlanner/AIDestinationDetailsModal.module.css'; // Re-use existing styles to save time, override where needed

const DestinationDetailsPage = () => {
    const { id } = useParams(); // Using ID to fetch
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchById = async () => {
            // Attempt to fetch by ID from DB first
            if (!isNaN(id)) {
                const data = await TripAI.getDestinationById(id);
                if (data) {
                    setDetails(data);
                    setLoading(false);
                    return;
                }
            }
            // Fallback: If ID is name or DB failed, try AI details (or search by name endpoint if we had one)
            // For now, if numeric fetch fails, we just don't set details or rely on AI strings
            const data = await TripAI.getDestinationDetails(id);
            setDetails(data);
            setLoading(false);
        };
        fetchById();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    // Fallback if details are partial
    const displayName = details?.name || id;
    const heroImage = details?.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1';

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            {/* Nav */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '1rem 2rem', zIndex: 50, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
                        <ArrowLeft size={20} /> Back
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{displayName}</span>
                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><Share2 size={20} /></button>
                </div>
            </nav>

            {/* Hero */}
            <div style={{ height: '60vh', position: 'relative', marginTop: '0' }}>
                <img src={heroImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)', display: 'flex', alignItems: 'flex-end', padding: '3rem 2rem' }}>
                    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', color: 'white' }}>
                        <h1 style={{ fontSize: '4rem', fontWeight: '800', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{displayName}</h1>
                        <div style={{ fontSize: '1.2rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={20} /> {details?.country || 'Explore this destination'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>

                {/* Left Column: Main Info */}
                <div>
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 className={styles.sectionTitle} style={{ fontSize: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <Info size={24} style={{ display: 'inline', marginRight: '10px' }} /> About
                        </h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#334155' }}>
                            {details?.description || `Discover the wonders of {displayName}. This destination offers a blend of rich history, vibrant culture, and stunning landscapes.`}
                        </p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 className={styles.sectionTitle} style={{ fontSize: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <Camera size={24} style={{ display: 'inline', marginRight: '10px' }} /> Top Attractions
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            {/* Fallback logic */}
                            {(details?.attractions && details.attractions.length > 0 ? details.attractions :
                                ['City Center', 'Old Town', 'Museum'].map(n => ({ name: n, type: 'Sightseeing' }))
                            ).map((att, idx) => (
                                <div key={idx} style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', background: 'white', border: '1px solid #e2e8f0' }}>
                                    <div style={{ height: '150px', background: '#e2e8f0' }}></div>
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{att.name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{att.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Sidebar */}
                <div>
                    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', position: 'sticky', top: '100px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0 }}>Plan Your Trip</h3>
                        <div style={{ margin: '1.5rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#64748b' }}>Budget / Day</span>
                                <span style={{ fontWeight: 'bold' }}>₹{details?.estimatedCostPerDay || '3,000'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#64748b' }}>Best Time</span>
                                <span style={{ fontWeight: 'bold' }}>{details?.bestTime || 'Oct - Mar'}</span>
                            </div>
                        </div>
                        <button style={{ width: '100%', background: '#2563eb', color: 'white', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }} onClick={() => navigate('/plan-trip')}>
                            Start Planning
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DestinationDetailsPage;
