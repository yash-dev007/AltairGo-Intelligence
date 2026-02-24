import React from 'react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
    return (
        <section className={styles.aboutSection} id="our-story">
            <div className={`container ${styles.aboutContainer}`}>
                <div className={styles.header}>
                    <span className={styles.subtitle}>OUR STORY</span>
                    <h2 className={styles.title}>
                        Designing the Future of <br className={styles.breakMobile} /><span className={styles.highlight}>Global Discovery.</span>
                    </h2>
                    <p className={styles.description}>
                        AltairGo was born from a simple belief: that travel should be about connection,
                        not just logistics. We combine cutting-edge intelligence with a human touch to
                        curate journeys that stay with you forever.
                    </p>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statBox}>
                        <h3 className={styles.statNumber}>10k+</h3>
                        <p className={styles.statLabel}>TRAVELERS</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3 className={styles.statNumber}>50+</h3>
                        <p className={styles.statLabel}>COUNTRIES</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3 className={styles.statNumber}>2.5k</h3>
                        <p className={styles.statLabel}>ITINERARIES</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3 className={styles.statNumber}>4.9/5</h3>
                        <p className={styles.statLabel}>SATISFACTION</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
