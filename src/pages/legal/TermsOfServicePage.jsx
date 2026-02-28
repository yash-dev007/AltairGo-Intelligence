import React from 'react';

const TermsOfServicePage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Terms of Service</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Welcome to ALTAIRGO INTELLIGENCE. By accessing or using our platform to plan and book your extraordinary journeys, you agree to comply with and be bound by the following terms and conditions.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Use of Service</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                You must use our services for lawful purposes only. Any unauthorized use of our proprietary AI algorithms or trip-planning tools, including scraping or unauthorized reproduction, is strictly prohibited.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Bookings and Payments</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                All bookings made through our platform are subject to availability and separate terms and conditions provided by our travel partners and vendors.
            </p>
            <p style={{ lineHeight: '1.6', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Last updated: October 2023
            </p>
        </div>
    );
};

export default TermsOfServicePage;
