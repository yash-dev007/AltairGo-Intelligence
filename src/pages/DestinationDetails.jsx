import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsData } from '../data/destinations';
import { MapPin, Star, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';

import styles from './DestinationDetails.module.css';

const DestinationDetails = () => {
    const { id } = useParams();
    const destination = destinationsData.find(d => d.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!destination) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center' }}>
                <h2>Destination not found</h2>
                <Link to="/destinations" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Destinations</Link>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <img
                    src={destination.image}
                    alt={destination.name}
                    className={styles.heroImage}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <Link to="/destinations" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to all destinations
                    </Link>
                    <h1 className={styles.title}>{destination.name}</h1>
                    <p className={styles.shortDesc}>{destination.desc}</p>
                    <div className={styles.metaTags}>
                        <div className={styles.metaTag}>
                            <MapPin size={18} /> {destination.location}
                        </div>
                        <div className={styles.metaTag}>
                            <Star size={18} fill="orange" stroke="none" /> {destination.rating} ({destination.reviews} reviews)
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.container}>

                {/* Main Content */}
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>About {destination.name}</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#475569', marginBottom: '3rem' }}>
                        {destination.description}
                    </p>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Highlights</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                        {destination.highlights && destination.highlights.map((highlight, index) => (
                            <div key={index} className={styles.highlightCard}>
                                <CheckCircle size={20} color="var(--primary)" />
                                <span style={{ fontWeight: '500', color: '#334155' }}>{highlight}</span>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>Suggested Itinerary</h3>
                    <div style={{ position: 'relative', borderLeft: '3px solid #e2e8f0', paddingLeft: '2rem', marginLeft: '1rem' }}>
                        {destination.itinerary && destination.itinerary.map((day, index) => (
                            <div key={index} className={styles.itineraryItem}>
                                <div className={styles.itineraryDot} />
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Day {index + 1}</h4>
                                <p style={{ color: '#64748b' }}>{day.replace(`Day ${index + 1}: `, '')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <aside>
                    <div className={styles.stickySidebar}>
                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Best time to visit</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>
                                <Calendar size={20} /> {destination.bestTime || 'Year Round'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Starting from</span>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                ₹{destination.price}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>per person</span>
                        </div>

                        <button className="btnPrimary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                            Book This Trip
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
                            Customizable packages available
                        </p>
                    </div>
                </aside>

            </div>
        </main>
    );
};

export default DestinationDetails;
