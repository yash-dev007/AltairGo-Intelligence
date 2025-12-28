import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Map, ArrowRight } from 'lucide-react';
import styles from '../components/Packages/Packages.module.css'; // Reusing styles

const PackagesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [packagesData, setPackagesData] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/packages')
            .then(res => res.json())
            .then(data => setPackagesData(data))
            .catch(err => console.error("Failed to fetch packages:", err));
    }, []);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Filter packages based on search term (title or description or list of inclusions)
    const filteredPackages = packagesData.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.inclusions.some(inc => inc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <section className={styles.section} style={{ paddingTop: '8rem' }}>
            <div className={styles.container}>
                <div className={styles.introContent} style={{ color: 'black', textAlign: 'center', marginBottom: '3rem', gridColumn: '1 / -1' }}>
                    <h2 className={styles.heading} style={{ color: '#0f172a' }}>All Tour Packages</h2>
                    <p className={styles.description} style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                        Explore our handpicked selection of adventures, from relaxing beach gateways to thrilling mountain treks.
                    </p>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder="Search destination, activity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                        />
                        <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                </div>

                {filteredPackages.length > 0 ? (
                    filteredPackages.map((pkg) => (
                        <div className={styles.card} key={pkg.id}>
                            <img
                                src={pkg.image}
                                alt={pkg.alt}
                                className={styles.image}
                            />
                            <div className={styles.overlay}>
                                <div>
                                    <h3 className={styles.cardTitle}>{pkg.title}</h3>
                                    <p className={styles.cardText} style={{ marginBottom: '1rem' }}>{pkg.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{pkg.price}</span>
                                        <Link to={`/packages/${pkg.id}`} className={styles.viewDetailsBtn}>
                                            View Details <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconWrapper}>
                            <Map size={40} color="#64748b" />
                        </div>
                        <h3 className={styles.emptyTitle}>No packages found</h3>
                        <p className={styles.emptyDesc}>
                            We couldn't find any packages matching "{searchTerm}". Try adjusting your search or browse our popular destinations.
                        </p>
                        <button className={styles.resetBtn} onClick={() => setSearchTerm('')}>
                            Clear Search
                        </button>
                    </div>
                )}

            </div>
        </section>
    );
};

export default PackagesPage;
