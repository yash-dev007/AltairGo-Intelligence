import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Destinations.module.css';
import { MapPin, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { destinationsData } from '../../data/destinations';

const Destinations = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);

    // Responsive items per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(4);
            }
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, destinationsData.length - itemsPerPage);

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const handlePrev = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    return (
        <section className={styles.section} id="destinations">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titles}>
                        <h2 className={styles.heading}>Trending Destinations</h2>
                        <p className={styles.subheading}>From island escapes to cool mountain towns, discover where your next journey will take you.</p>
                    </div>
                </div>

                <div className={styles.carouselViewport}>
                    <div
                        className={styles.carouselTrack}
                        style={{
                            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
                        }}
                    >
                        {destinationsData.map(dest => (
                            <Link
                                to={`/destinations/${dest.id}`}
                                key={dest.id}
                                className={styles.card}
                                style={{
                                    // Override flex-basis dynamically for responsiveness
                                    // We subtract spacing to account for the gap in flex container
                                    flex: `0 0 calc(${100 / itemsPerPage}% - var(--spacing-md))`,
                                    textDecoration: 'none'
                                }}
                            >
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
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <Link to="/destinations" className={styles.viewMoreBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                        View more
                    </Link>
                    <div className={styles.arrows}>
                        <button
                            className={styles.arrowBtn}
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            style={{ opacity: currentIndex === 0 ? 0.5 : 1, cursor: currentIndex === 0 ? 'default' : 'pointer' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            className={styles.arrowBtn}
                            onClick={handleNext}
                            disabled={currentIndex >= maxIndex}
                            style={{ opacity: currentIndex >= maxIndex ? 0.5 : 1, cursor: currentIndex >= maxIndex ? 'default' : 'pointer' }}
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Destinations;
