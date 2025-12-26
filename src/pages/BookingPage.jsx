import React, { useEffect } from 'react';
import BookingWidget from '../components/Booking/BookingWidget';
import homeBg from '../assets/palawan.png'; // Using valid asset

const BookingPage = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '4rem' }}>
            {/* Background */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: -1,
                backgroundImage: `url(${homeBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.6)'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '1rem',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                    Plan Your Perfect Trip
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    color: '#e2e8f0',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                }}>
                    Compare prices, find the best deals, and book your next adventure with confidence.
                </p>

                <div style={{ marginTop: '2rem' }}>
                    <BookingWidget />
                </div>

                {/* Optional: Add some "Offers" or "Recent Searches" section below if needed later */}
            </div>
        </div>
    );
};

export default BookingPage;
