import React, { useEffect, useState } from 'react';
import styles from './Features.module.css';
import { Map, Calendar, Headset, Instagram, Twitter, Facebook, Zap, MapPin, IndianRupee } from 'lucide-react'; // Imports remain
import { FeaturesSkeleton } from '../Skeleton/Skeleton';

import { API_BASE_URL } from '../../config';

const Features = () => {
    const [features, setFeatures] = useState({ stats: [], cards: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/features`)
            .then(res => res.json())
            .then(data => {
                setFeatures(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch features:", err);
                setLoading(false);
            });
    }, []);

    // Icon helper map
    const IconMap = {
        "Zap": Zap,
        "MapPin": MapPin,
        "IndianRupee": IndianRupee,
        "Map": Map,
        "Calendar": Calendar,
        "Headset": Headset
    };

    if (loading) return <section className={styles.features} id="about"><FeaturesSkeleton /></section>;

    return (
        <section className={styles.features} id="about">
            <div className={styles.container}>
                <div className={styles.leftContent}>
                    {features.about && (
                        <>
                            <h2 className={styles.heading}>
                                {features.about.heading_prefix} <span className={styles.brandGradient}>{features.about.heading_highlight}</span>
                            </h2>
                            <p className={styles.description}>
                                {features.about.description}
                            </p>
                        </>
                    )}

                    <div className={styles.socials}>
                        <Instagram size={20} className={styles.socialIcon} />
                        <Twitter size={20} className={styles.socialIcon} />
                        <Facebook size={20} className={styles.socialIcon} />
                    </div>

                    <div className={styles.statsRow}>
                        {features.stats.map(stat => {
                            const IconComponent = IconMap[stat.icon] || Zap;
                            return (
                                <div className={styles.statItem} key={stat.id}>
                                    <div className={styles.statIconCircle}><IconComponent size={24} /></div>
                                    <div className={styles.statText}>
                                        <strong>{stat.highlight}</strong>
                                        <span>{stat.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.rightContent}>
                    {/* Dynamic Feature Cards */}
                    {features.cards.map(card => {
                        const CardIcon = IconMap[card.icon] || Map;
                        return (
                            <div className={styles.card} key={card.id}>
                                <div className={styles.cardIconBox}><CardIcon size={32} /></div>
                                <div className={styles.cardContent}>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;
