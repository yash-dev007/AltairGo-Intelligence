import React from 'react';

const CancellationPolicyPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Cancellation Policy</h1>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                We understand that plans can change unexpectedly. Below is the general cancellation framework for experiences booked through ALTAIRGO INTELLIGENCE.
            </p>
            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Fully Refundable</h3>
                <p style={{ lineHeight: '1.6' }}>Cancellations made 30 days or more prior to the departure date receive a 100% refund of the trip cost.</p>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Partially Refundable</h3>
                <p style={{ lineHeight: '1.6' }}>Cancellations made between 15 and 29 days prior to the departure date receive a 50% refund.</p>
            </div>
            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Non-Refundable</h3>
                <p style={{ lineHeight: '1.6' }}>Cancellations made 14 days or less prior to the departure date are strictly non-refundable due to vendor commitments.</p>
            </div>
            <p style={{ lineHeight: '1.6', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Please note: bespoke private jet charters and exclusive-use villa rentals frequently carry stricter, custom cancellation terms detailed in your specific contract.
            </p>
        </div>
    );
};

export default CancellationPolicyPage;
