import React, { useEffect } from 'react';
import BookingWidget from '../components/Booking/BookingWidget';
import styles from './BookingPage.module.css';
import { Search, MapPin, Users, Star, CheckCircle, Shield, Award } from 'lucide-react';
import homeBg from '../assets/hero_bg_gen.png';

// Placeholder images - using high quality unsplash images
// Placeholder images - using high quality unsplash images
const locations = [
    // Row 1: Big, Small, Small
    { name: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80', span: 2 },
    { name: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80', span: 1 },
    { name: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80', span: 1 },

    // Row 2: Small, Big, Small
    { name: 'India', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80', span: 1 },
    { name: 'Switzerland', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80', span: 2 },
    { name: 'Mexico', image: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&q=80', span: 1 },

    // Row 3: Small, Small, Big
    { name: 'Iceland', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80', span: 1 },
    { name: 'Italy', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80', span: 1 },
    { name: 'Greece', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80', span: 2 },
];

const flights = [
    {
        airline: 'AstraFlight 215',
        from: 'Toronto',
        to: 'Bangkok',
        price: '$300',
        seats: '5',
        image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80',
        rating: 4.8,
        date: 'Sep 04 - Sep 11, 2024'
    },
    {
        airline: 'Cloudrider 789',
        from: 'Chicago',
        to: 'Melbourne',
        price: '$550',
        seats: '2',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80',
        rating: 4.7,
        date: 'Sep 11 - Sep 13, 2024'
    },
    {
        airline: 'Aether Express 901',
        from: 'Miami',
        to: 'Tokyo',
        price: '$450',
        seats: '12',
        image: 'https://images.unsplash.com/photo-1520667086052-b8832a83dfa3?auto=format&fit=crop&q=80',
        rating: 4.5,
        date: 'Sep 21 - Sep 24, 2024'
    },
    {
        airline: 'Silverwing 505',
        from: 'Boston',
        to: 'Singapore',
        price: '$700',
        seats: '10',
        image: 'https://images.unsplash.com/photo-1542296332-2e44a0482838?auto=format&fit=crop&q=80',
        rating: 4.9,
        date: 'Oct 17 - Oct 19, 2024'
    }
];

const BookingPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.pageContainer}>
            {/* Hero Section */}
            <div
                className={styles.heroBackground}
                style={{ backgroundImage: `url(${homeBg})` }}
            >
                <div className={styles.overlay} />
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Discover the World, One <span className={styles.highlight}>Flight</span><br />
                        at a Time with DreamsTour!
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Your ultimate destination for all things travel. Help you celebrate & remember your experience.
                    </p>
                </div>
            </div>

            {/* Booking Widget */}
            <div className={styles.widgetWrapper}>
                <BookingWidget />
            </div>

            {/* Popular Locations */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.highlight}>Popular</span> Locations
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Connecting Needs with Offers for the Professional Flight Services. Book your next flight appointment with ease.
                    </p>
                </div>

                <div className={styles.locationGrid}>
                    {locations.map((loc, index) => (
                        <div
                            key={index}
                            className={`${styles.locationCard} ${loc.span === 2 ? styles.colSpan2 : ''}`}
                        >
                            <img src={loc.image} alt={loc.name} />
                            <div className={styles.locationLabel}>{loc.name}</div>

                        </div>
                    ))}
                </div>
            </section>

            {/* Unique Experiences */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.highlight}>Focusing</span> on Unique Experiences.
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Connecting Needs with Offers for the Professional Flight Services. Book your next flight appointment with ease.
                    </p>
                </div>

                <div className={styles.flightGrid}>
                    {flights.map((flight, index) => (
                        <div key={index} className={styles.flightCard}>
                            <div className={styles.flightImageWrapper}>
                                <img src={flight.image} alt={flight.airline} className={styles.flightImage} />
                                <div className={styles.badge}>Cheapest</div>
                                <div className={styles.rating}>⭐ {flight.rating}</div>
                            </div>

                            <div className={styles.flightDetails}>
                                <div className={styles.route}>
                                    <span>{flight.from}</span>
                                    <span>✈</span>
                                    <span>{flight.to}</span>
                                </div>
                                <h3 className={styles.flightName}>{flight.airline}</h3>
                                <div className={styles.flightMeta}>
                                    <span>📅 {flight.date}</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span className={styles.price}>From {flight.price}</span>
                                    <span className={styles.seatsLeft}>{flight.seats} Seats Left</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button className={styles.viewAllBtn} style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '1rem 3rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: 'none',
                        fontSize: '1rem',
                        transition: 'transform 0.2s'
                    }}>
                        View All Flights &gt;
                    </button>
                </div>

            </section>

            {/* Top Rated Providers */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.highlight}>Top</span> Rated Providers
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Connecting Needs with Offers for the Professional Salon Services. Book your next salon appointment with ease.
                    </p>
                </div>

                <div className={styles.providersGrid}>
                    {['Delta Air Lines', 'Lufthansa', 'Etihad Airways', 'Kuwait Airways'].map((provider, i) => (
                        <div key={i} className={styles.providerCard}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: '#f1f5f9', borderRadius: '50%',
                                margin: '0 auto 1.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: '#64748b'
                            }}>
                                Logo
                            </div>
                            <h4 className={styles.providerName}>{provider}</h4>
                            <div className={styles.providerRating}>⭐ 4.5 2000 Reviews</div>
                            <div className={styles.providerMeta}>
                                <span>12+ Flights</span>
                                <span>85+ Locations</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.section}>
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}><Award size={20} /></div>
                        <div className={styles.featureContent}>
                            <h4>VIP Packages</h4>
                            <p>Include premium seating, meet-and-greet experiences, backstage tours.</p>
                        </div>
                    </div>
                    <div className={`${styles.featureCard} ${styles.highlight}`} style={{ background: '#f3e8ff', color: '#6b21a8' }}>
                        <div className={styles.featureIcon} style={{ color: '#6b21a8' }}><Shield size={20} /></div>
                        <div className={styles.featureContent}>
                            <h4>Travel Packages</h4>
                            <p>Bundles that include concert tickets, accommodations.</p>
                        </div>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon} style={{ color: '#059669' }}><CheckCircle size={20} /></div>
                        <div className={styles.featureContent}>
                            <h4>Best Price Guarantee</h4>
                            <p>Such as private rehearsals, soundcheck access.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <div className={styles.bottomCta}>
                <div className={styles.section}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>
                            <span className={styles.highlight}>Where comfort</span> meets elegance and every guest is treated like family.
                        </h2>
                        <p className={styles.ctaText}>
                            Our mission is to create memorable experiences for our guests. We believe that every stay should feel special, whether you're here for business, leisure, or a special occasion.
                        </p>

                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <h3>57+</h3>
                                <p>Destinations Worldwide</p>
                            </div>
                            <div className={styles.statItem}>
                                <h3>121+</h3>
                                <p>Providers Registered</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className={styles.redArc}></div>
                </div>
                {/* Plane image - using a generic plane image since asset is missing */}
                <img
                    src="https://cdn.pixabay.com/photo/2016/09/22/16/36/airplane-1687667_1280.png"
                    alt="Airplane"
                    className={styles.planeImage}
                    loading="lazy"
                />

            </div>
        </div>
    );
};

export default BookingPage;
