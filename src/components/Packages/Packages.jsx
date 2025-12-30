import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Packages.module.css';
import { ArrowRight } from 'lucide-react';

import { API_BASE_URL } from '../../config';

const Packages = () => {
    // Show only first 4 packages for the homepage preview
    const [previewPackages, setPreviewPackages] = React.useState([]);

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/packages`)
            .then(res => res.json())
            .then(data => setPreviewPackages(data.slice(0, 4)))
            .catch(err => console.error("Failed to fetch packages:", err));
    }, []);

    return (
        <section className={styles.section} id="packages">
            <div className={styles.container}>

                {/* Intro Card */}
                <div className={`${styles.card} ${styles.introCard}`}>
                    <div className={styles.introContent}>
                        <h2 className={styles.heading}>Tour Packages</h2>
                        <p className={styles.description}>Affordable, customizable, and unforgettable adventures across the Philippines.</p>
                        <Link to="/packages" className={styles.browseBtn} style={{ display: 'inline-block', textDecoration: 'none' }}>Browse all packages</Link>
                    </div>
                </div>

                {/* Dynamic Package Cards */}
                {previewPackages.map((pkg) => (
                    <div className={styles.card} key={pkg.id}>
                        <img
                            src={pkg.image}
                            alt={pkg.alt}
                            className={styles.image}
                        />
                        <div className={styles.overlay}>
                            <div>
                                <h3 className={styles.cardTitle}>{pkg.title}</h3>
                                <p className={styles.cardText}>{pkg.description}</p>
                                {/* Make the card clickable via a covering link or button, but for now just text or wrapping div? 
                                    Let's add a View Details link to be explicit and accessible.
                                */}
                                <div style={{ marginTop: '1rem' }}>
                                    <Link to={`/packages/${pkg.id}`} className={styles.viewDetailsBtn}>
                                        View Details <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <Link to="/packages" className="btnPrimary">View More Packages</Link>
            </div>
        </section>
    );
};

export default Packages;
