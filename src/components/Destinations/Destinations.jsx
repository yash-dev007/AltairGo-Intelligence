import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Destinations.module.css';
import { MapPin, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { DestinationsSkeleton } from '../Skeleton/Skeleton';

import { API_BASE_URL } from '../../config';

const Destinations = () => {
    const [destinationsData, setDestinationsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = React.useRef(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/destinations`)
            .then(res => res.json())
            .then(data => { setDestinationsData(data); setLoading(false); })
            .catch(err => { console.error("Failed to fetch destinations:", err); setLoading(false); });
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
                        {loading ? <DestinationsSkeleton count={5} /> : destinationsData.map(dest => (
                            <Link
                                to={`/destinations/${dest.id}`}
                                key={dest.id}
                                className={`${styles.card} ${styles.carouselItem}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <img src={dest.image} alt={dest.name} className={styles.image} />
                                <div className={styles.overlay}>
                                    <div className={styles.tag}>
                                        {dest.price === "Free" || dest.price === 0 || dest.price === "0" ?
                                            "Free" :
                                            `starts at ${dest.price}`}
                                    </div>
                                    <div className={styles.content}>
                                        <h3 className={styles.name}>{dest.name}</h3>
                                        <p className={styles.description}>{dest.desc}</p>

                                        <div className={styles.cardFooter}>
                                            <div className={styles.rating}>
                                                <Star size={14} fill="#fbbf24" stroke="none" />
                                                <span>{dest.rating} ({dest.reviews})</span>
                                            </div>
                                            <div className={styles.location}>
                                                <MapPin size={14} />
                                                <span>{dest.location}</span>
                                            </div>
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
