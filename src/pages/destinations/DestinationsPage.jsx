import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import styles from './DestinationsPage.module.css';
import { API_BASE_URL } from '../../config';
import DestinationCard from '../../components/DestinationCard/DestinationCard';

// ── Variable Size Logic for Bento Grid ──
const getCardSizeClass = (index) => {
    // Pattern to create a varied "bento" look
    const i = index % 10;
    if (i === 0) return 'large';
    if (i === 3 || i === 7) return 'tall';
    if (i === 4 || i === 8) return 'wide';
    return 'default';
};

const DestinationsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [destinationsData, setDestinationsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/destinations`)
            .then(res => res.json())
            .then(data => {
                setDestinationsData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch destinations:", err);
                setLoading(false);
            });
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
                        Explore the World
                    </h1>
                    <p className={styles.pageSubtitle}>
                        Discover our full range of breathtaking locations handcrafted for your perfect getaway.
                    </p>

                    {/* Search Bar */}
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search dreamy locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search size={20} className={styles.searchIcon} />
                    </div>
                </div>


                {loading ? (
                    <div className={styles.grid}>
                        {Array(8).fill(0).map((_, index) => {
                            const variant = getCardSizeClass(index);
                            const sizeStyle = styles[`card_${variant}`] || '';
                            return (
                                <div key={index} className={`${styles.skeleton} ${sizeStyle}`} />
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredDestinations.length > 0 ? (
                            filteredDestinations.map((dest, index) => (
                                <DestinationCard
                                    key={dest.id}
                                    dest={dest}
                                    variant={getCardSizeClass(index)}
                                />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                <p style={{ fontSize: '1.2rem' }}>No destinations found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main >
    );
};

export default DestinationsPage;
