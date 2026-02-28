import React from 'react';

const CareersPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Careers at ALTAIRGO</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
                We are always seeking exceptional talent to join our team of global travel designers, software engineers, and client success managers.
            </p>
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', borderLeft: '4px solid var(--accent)', marginBottom: '1rem', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Senior Travel Architect</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Remote / Global</p>
                <button style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply Now</button>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', borderLeft: '4px solid var(--accent)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Machine Learning Engineer</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>San Francisco / Hybrid</p>
                <button style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply Now</button>
            </div>
        </div>
    );
};

export default CareersPage;
