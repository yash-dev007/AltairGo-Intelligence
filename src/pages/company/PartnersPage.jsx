import React from 'react';

const PartnersPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Partner With Us</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
                ALTAIRGO INTELLIGENCE collaborates exclusively with five-star properties, elite private aviation firms, and distinguished local experiences worldwide.
            </p>
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--primary)' }}>Become a Preferred Partner</h2>
                <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    If you believe your service matches the extraordinary standards our clients expect, we invite you to apply.
                </p>
                <button style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Submit Application</button>
            </div>
        </div>
    );
};

export default PartnersPage;
