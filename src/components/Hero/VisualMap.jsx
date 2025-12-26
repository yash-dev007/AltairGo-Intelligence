import React from 'react';
import styles from './VisualMap.module.css';
import { MapPin, Gem, Star, Users } from 'lucide-react';

const VisualMap = () => {
    return (
        <div className={styles.visualWrapper}>
            {/* Abstract Map Background */}
            <div className={styles.mapBackground}>
                {/* Grid lines or abstract dots */}
                <div className={styles.grid}></div>

                {/* Map Elements (Mock) */}
                <div className={styles.landmass} style={{ top: '10%', left: '10%', width: '60%', height: '50%' }}></div>
                <div className={styles.landmass} style={{ top: '50%', left: '40%', width: '50%', height: '40%' }}></div>
            </div>

            {/* Pins */}
            <div className={`${styles.pin} ${styles.pinCrowded}`} style={{ top: '25%', left: '35%' }}>
                <div className={styles.pinIcon}><Users size={14} /></div>
                <div className={styles.pinLabel}>Overcrowded</div>
            </div>

            <div className={`${styles.pin} ${styles.pinGem}`} style={{ top: '55%', left: '60%' }}>
                <div className={styles.pinIcon}><Gem size={14} /></div>
                <div className={styles.pinLabel}>Hidden Gem</div>
            </div>

            <div className={`${styles.pin} ${styles.pinNormal}`} style={{ top: '40%', left: '20%' }}>
                <div className={styles.pinIcon}><MapPin size={14} /></div>
                <div className={styles.pinLabel}>Must Visit</div>
            </div>


            {/* Floating Itinerary Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <span className={styles.day}>Day 1</span>
                    <span className={styles.route}>Shillong → Dawki</span>
                </div>
                <div className={styles.cardStats}>
                    <div className={styles.stat}>
                        <Users size={12} className={styles.statIcon} />
                        <span className={styles.lowCrowd}>Low Crowds</span>
                    </div>
                    <div className={styles.stat}>
                        <Star size={12} className={styles.statIcon} />
                        <span>9.2 Worth-it</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualMap;
