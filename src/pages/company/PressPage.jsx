import React from 'react';

const PressPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Press & Media</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
                For all media and press-related inquiries, please contact our PR division at press@altairgo.com.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Recent Mentions</h2>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                <li style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>"Redefining Luxury Travel with Artificial Intelligence"</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Condé Nast Traveler - September 2023</p>
                </li>
                <li style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>"The Future of Bespoke Itineraries"</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Forbes - July 2023</p>
                </li>
            </ul>
        </div>
    );
};

export default PressPage;
