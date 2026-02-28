import React from 'react';

const SafetyPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Trust & Safety</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Your safety is our priority. ALTAIRGO INTELLIGENCE rigorously vets all our local partners, experiences, and accommodations to ensure they meet international safety standards.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>24/7 On-Trip Support</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Every ALTAIRGO traveler possesses a direct, encrypted communication line to our global security team. Whether you need medical assistance, translation services, or emergency evacuation, we are constantly monitoring your well-being.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Data Encryption</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Your travel itineraries, payment details, and personal data are shielded using military-grade encryption protocols across our entire technical infrastructure.
            </p>
        </div>
    );
};

export default SafetyPage;
