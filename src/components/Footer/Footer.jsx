import React from 'react';
import styles from './Footer.module.css';
import logo from '../../assets/logo_corrected.png'; // Import Corrected Logo
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.mainContent}>
                        <div className={styles.brandCol}>
                            <img src={logo} alt="ALTAIRGO INTELLIGENCE" className={styles.brandLogo} />
                            <p className={styles.brandDesc}>
                                Curating the world's most extraordinary journeys. Join our community of explorers and discover the unseen.
                            </p>
                            <div className={styles.socials}>
                                <a href="#" className={styles.socialLink} aria-label="Instagram"><Instagram size={18} /></a>
                                <a href="#" className={styles.socialLink} aria-label="Twitter"><Twitter size={18} /></a>
                                <a href="#" className={styles.socialLink} aria-label="Facebook"><Facebook size={18} /></a>
                                <a href="#" className={styles.socialLink} aria-label="Youtube"><Youtube size={18} /></a>
                            </div>
                        </div>

                        <div className={styles.linksGroup}>
                            <div className={styles.linksCol}>
                                <h3 className={styles.colTitle}>Company</h3>
                                <a href="#">About Us</a>
                                <a href="#">Careers</a>
                                <a href="#">Press</a>
                                <a href="#">Partners</a>
                            </div>

                            <div className={styles.linksCol}>
                                <h3 className={styles.colTitle}>Support</h3>
                                <a href="#">Help Center</a>
                                <a href="#">Safety</a>
                                <a href="#">Cancellation</a>
                                <a href="#">Privacy</a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.newsletterCol}>
                        <h3 className={styles.newsletterTitle}>Unlock the World</h3>
                        <p className={styles.newsletterDesc}>Get curated itineraries and travel secrets delivered to your inbox.</p>
                        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                            <div className={styles.inputGroup}>
                                <Mail size={16} className={styles.inputIcon} />
                                <input type="email" placeholder="Enter your email" className={styles.input} />
                                <button type="submit" className={styles.submitBtn}>
                                    Subscribe
                                </button>
                            </div>
                        </form>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <MapPin size={16} />
                                <span>Nashik, Maharashtra, India</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <p>© 2025 ALTAIRGO INTELLIGENCE. All rights reserved.</p>
                    <div className={styles.legalLinks}>
                        <a href="#">Terms of Service</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
