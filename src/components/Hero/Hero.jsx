import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.container}>
        <h1 className={styles.title}>
          Explore Exotic <br /> <span className={styles.highlight}>Destinations</span> with Us
        </h1>

        <p className={styles.subtitle}>
          Know what’s worth visiting, when to go, and how to avoid crowds & high prices - all in one place
        </p>

        <div className={styles.actions}>
          <Link to="/plan-trip" className={styles.btnWhite}>Plan Your Trip</Link>
          <Link to="/packages" className={styles.btnOutline}>Explore Packages</Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
