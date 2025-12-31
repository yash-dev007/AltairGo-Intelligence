import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Destinations.module.css';
import { MapPin, Star, ArrowRight, ArrowLeft } from 'lucide-react';

import { API_BASE_URL } from '../../config';

const Destinations = () => {
    const [destinationsData, setDestinationsData] = useState([]);
    const scrollRef = React.useRef(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/destinations`)
            .then(res => res.json())
            .then(data => setDestinationsData(data))
            .catch(err => console.error("Failed to fetch destinations:", err));
    }, []);

    const handleNext = () => {
        if (scrollRef.current) {
            const viewport = scrollRef.current;
            const scrollAmount = viewport.clientWidth; // Scroll one viewport width
            viewport.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (scrollRef.current) {
            const viewport = scrollRef.current;
            const scrollAmount = viewport.clientWidth;
            viewport.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
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

                <div className={styles.carouselViewport} ref={scrollRef}>
                    <div className={styles.carouselTrack}>
                        {destinationsData.map(dest => (
                            <Link
                                to={`/destinations/${dest.id}`}
                                key={dest.id}
                                className={`${styles.card} ${styles.carouselItem}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <img src={dest.image} alt={dest.name} className={styles.image} />
                                <div className={styles.overlay}>
                                    <div className={styles.tag}>starts at ₹{dest.price}</div>
                                    <div className={styles.content}>
                                        <h3 className={styles.name}>{dest.name}</h3>
                                        <div className={styles.metaRow}>
                                            <span className={styles.description}>{dest.desc}</span>
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
                        View all destinations
                    </Link>

                    {/* Desktop Arrows Positioned Bottom Right */}
                    <div className={`${styles.arrows} ${styles.desktopArrows}`}>
                        <button className={styles.arrowBtn} onClick={handlePrev}><ArrowLeft size={20} /></button>
                        <button className={styles.arrowBtn} onClick={handleNext}><ArrowRight size={20} /></button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Destinations;
