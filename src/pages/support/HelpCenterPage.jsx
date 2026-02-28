import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Help Center</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '2rem' }}>
                How can we help you today? Search our FAQs or contact our support team directly.
            </p>

            <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Booking Inquiries</h2>
                    <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                        Need help modifying a trip date or changing passenger details? Our agents are available 24/7.
                    </p>
                    <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>Contact Support &rarr;</Link>
                </div>

                <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Payment Issues</h2>
                    <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                        Having trouble with a transaction? We support major credit cards, PayPal, and designated cryptocurrency wallets.
                    </p>
                    <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>View Payment FAQs &rarr;</Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
