import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const PackageDetails = () => {
    const { id } = useParams();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/packages/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Package not found");
                return res.json();
            })
            .then(data => {
                setPkg(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch package:", err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="global-spinner-container">
                <div className="global-spinner"></div>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div style={{ padding: '10rem', textAlign: 'center' }}>
                <h2>Package not found</h2>
                <Link to="/packages" className="btnPrimary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Packages</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '8rem', paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

            <Link to="/packages" style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                ← Back to all packages
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                {/* Image Section */}
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '400px' }}>
                    <img src={pkg.image} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                {/* Details Section */}
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2', marginBottom: '1rem' }}>
                        {pkg.title}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        {pkg.description}
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Price</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>{pkg.price}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Duration</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155' }}>{pkg.duration}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Difficulty</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155' }}>{pkg.difficulty}</span>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>What's Included</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {pkg.inclusions.map((item, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span> {item}
                            </li>
                        ))}
                    </ul>

                    <button className="btnPrimary" style={{ width: '100%', padding: '1rem', textAlign: 'center' }}>Book This Tour Now</button>
                </div>
            </div>

            <div style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Itinerary</h2>
                <div
                    style={{ lineHeight: '1.8', color: '#334155' }}
                    dangerouslySetInnerHTML={{ __html: pkg.itinerary }}
                />
                {/* Styles for itinerary content */}
                <style>{`
                    h3 { color: var(--text-main); font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                    p { margin-bottom: 1rem; }
                `}</style>
            </div>

        </div>
    );
};

export default PackageDetails;
