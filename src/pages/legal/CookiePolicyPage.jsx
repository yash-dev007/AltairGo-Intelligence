import React from 'react';

const CookiePolicyPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Cookie Policy</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                ALTAIRGO INTELLIGENCE uses cookies to provide a better, more personalized experience when you interact with our platform.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>What are Cookies?</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Cookies are small text files placed on your device to help sites remember you and your preferences. They are widely used to make websites work more efficiently and to provide information to site owners.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>How We Use Cookies</h2>
            <ul style={{ lineHeight: '1.6', marginBottom: '1rem', listStyleType: 'disc', paddingLeft: '20px' }}>
                <li>To remember your login status and authentication tokens.</li>
                <li>To store your travel preferences and recent searches.</li>
                <li>To analyze platform traffic and improve user experience.</li>
            </ul>
            <p style={{ lineHeight: '1.6', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Last updated: October 2023
            </p>
        </div>
    );
};

export default CookiePolicyPage;
