import React from 'react';

const AboutUsPage = () => {
    return (
        <div style={{ padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>About ALTAIRGO</h1>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Our Mission</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Curating the world's most extraordinary journeys. We blend rigorous local expertise with cutting-edge AI to uncover the unseen.
            </p>
            <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>The Intelligence Difference</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                At ALTAIRGO INTELLIGENCE, we recognize that true luxury is defined by flawless execution. From private aviation logistics to gaining access to exclusive events globally, our technology anticipates your needs before you articulate them.
            </p>
        </div>
    );
};

export default AboutUsPage;
