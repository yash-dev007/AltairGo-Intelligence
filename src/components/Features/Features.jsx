import React from 'react';
import styles from './Features.module.css';
import { Map, Calendar, Headset, Instagram, Twitter, Facebook, Zap, MapPin, IndianRupee } from 'lucide-react';

const Features = () => {
    return (
        <section className={styles.features} id="about">
            <div className={styles.container}>
                <div className={styles.leftContent}>
                    <h2 className={styles.heading}>
                        Why Travelers Plan Smarter Trips with <span className={styles.brandGradient}>AltairGo</span>
                    </h2>
                    <p className={styles.description}>
                        We help travelers decide what’s worth visiting, when to go, and what to skip — using crowd insights, smart itineraries, and real travel data.
                    </p>

                    <div className={styles.socials}>
                        <Instagram size={20} className={styles.socialIcon} />
                        <Twitter size={20} className={styles.socialIcon} />
                        <Facebook size={20} className={styles.socialIcon} />
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <div className={styles.statIconCircle}><Zap size={24} /></div>
                            <div className={styles.statText}>
                                <strong>Crowd-Aware</strong>
                                <span>Itineraries</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statIconCircle}><MapPin size={24} /></div>
                            <div className={styles.statText}>
                                <strong>Place-Level</strong>
                                <span>Intelligence</span>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statIconCircle}><IndianRupee size={24} /></div>
                            <div className={styles.statText}>
                                <strong>Budget-Smart</strong>
                                <span>Planning</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.rightContent}>
                    {/* Feature Cards */}
                    <div className={styles.card}>
                        <div className={styles.cardIconBox}><Map size={32} /></div>
                        <div className={styles.cardContent}>
                            <h3>Smart Itineraries</h3>
                            <p>Day-wise plans optimized for time, distance, and real travel pace — not rushed schedules.</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIconBox}><Calendar size={32} /></div>
                        <div className={styles.cardContent}>
                            <h3>Crowd Intelligence</h3>
                            <p>Know which places are overcrowded, underrated, or best visited at specific times.</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIconBox}><Headset size={32} /></div>
                        <div className={styles.cardContent}>
                            <h3>Hidden Gems</h3>
                            <p>Discover lesser-known places locals love — not just Instagram hotspots.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
