import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import styles from '../components/Destinations/Destinations.module.css'; // Reusing styles where possible
import { API_BASE_URL } from '../config';

// We might need some page-specific styles, so we can inline them or create a new module. 
// For consistency, I will reuse the card styles from generic molecules but create a page layout here.
// To avoid conflicts with the homepage section, I'll use inline styles for the page container logic 
// or create a simple wrapper.

const DestinationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [destinationsData, setDestinationsData] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/destinations`)
            .then(res => res.json())
            .then(data => setDestinationsData(data))
            .catch(err => console.error("Failed to fetch destinations:", err));
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const filteredDestinations = destinationsData.filter(dest =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh', backgroundColor: '#fff' }}>
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        All Destinations
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Discover our full range of breathtaking locations handcrafted for your perfect getaway.
                    </p>

                    {/* Search Bar */}
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search by name, location, or vibe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search size={20} className={styles.searchIcon} />
                    </div>
                </div>

                {/* Grid */}
                <div className={styles.grid}>
                    {filteredDestinations.length > 0 ? (
                        filteredDestinations.map(dest => (
                            <Link to={`/destinations/${dest.id}`} key={dest.id} className={styles.card} style={{ textDecoration: 'none' }}>
                                <img src={dest.image} alt={dest.name} className={styles.image} />
                                <div className={styles.overlay}>
                                    <div className={styles.tag}>starts at ₹{dest.price}</div>
                                    <div className={styles.content}>
                                        <h3 className={styles.name}>{dest.name}</h3>
                                        <div className={styles.metaRow}>
                                            <span>{dest.desc}</span>
                                            <span className={styles.dot}>•</span>
                                            <div className={styles.rating}>
                                                <Star size={12} fill="orange" stroke="none" />
                                                <span>{dest.rating} ({dest.reviews})</span>
                                            </div>
                                        </div>
                                        <div className={styles.location}>
                                            <MapPin size={12} />
                                            <span>{dest.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <p style={{ fontSize: '1.2rem' }}>No destinations found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default DestinationsPage;
