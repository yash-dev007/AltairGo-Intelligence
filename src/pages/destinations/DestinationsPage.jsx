import React, { useEffect, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
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
                            <div style={{
                                gridColumn: '1 / -1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6rem 2rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '1.5rem',
                                border: '1px dashed #cbd5e1',
                                textAlign: 'center',
                                marginTop: '2rem'
                            }}>
                                <SearchX size={48} style={{ color: '#94a3b8', marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>No destinations found</h3>
                                <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '400px' }}>
                                    We couldn't find any destinations matching "{searchTerm}". Try adjusting your search or explore our popular destinations.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main >
    );
};

export default DestinationsPage;
