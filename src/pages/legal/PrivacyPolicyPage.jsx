import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Privacy Policy</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                At ALTAIRGO INTELLIGENCE, we take your privacy seriously. This page outlines how we collect, use, and protect your personal data when you use our services.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Information We Collect</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                We collect information you explicitly provide to us when you create an account, plan a trip, or contact customer support. This may include your name, email address, travel preferences, and payment information.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>How We Use Your Information</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                The information we collect is used to personalize your travel itineraries, process your bookings, and communicate with you about your trips and our services.
            </p>
            <p style={{ lineHeight: '1.6', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Last updated: October 2023
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;
