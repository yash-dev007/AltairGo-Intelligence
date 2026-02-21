import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import styles from './DestinationCard.module.css';

const DestinationCard = ({ dest, variant = 'default' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Map variant to style class
    const sizeClass = styles[`card_${variant}`] || '';

    return (
        <Link
            to={`/destinations/${dest.id}`}
            className={`${styles.card} ${sizeClass}`}
        >
            {/* Show skeleton until image loads */}
            {!imageLoaded && (
                <div
                    className={styles.skeleton}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        borderRadius: '24px' // Match card border radius
                    }}
                />
            )}

            <img
                src={dest.image}
                alt={dest.name}
                className={styles.image}
                onLoad={() => setImageLoaded(true)}
                style={{ opacity: imageLoaded ? 1 : 0 }}
            />

            <div className={styles.overlay}>
                <div className={styles.headerInfo}>
                    {/* Tags */}
                    {(dest.crowd_level) && <div className={styles.tag}>{dest.crowd_level}</div>}
                    {dest.estimated_cost_per_day ? (
                        <div className={`${styles.tag} ${styles.priceTag}`}>
                            ₹{dest.estimated_cost_per_day}/day
                        </div>
                    ) : null}
                </div>

                <div className={styles.content}>
                    <div className={styles.location}>
                        <MapPin size={14} />
                        <span>{dest.location}</span>
                    </div>
                    <h3 className={styles.name}>{dest.name}</h3>
                    <p className={styles.description}>{dest.desc}</p>

                    <div className={styles.cardFooter}>
                        <div className={styles.rating}>
                            <Star size={14} fill="#fbbf24" stroke="none" />
                            <span>{dest.rating || 'New'}</span>
                        </div>
                        <div className={styles.arrow}>
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DestinationCard;
