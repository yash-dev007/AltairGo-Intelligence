import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import logo from '../../assets/logo_corrected.png'; // Import Corrected Logo
import { Globe, Instagram, Mail } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setStatus({ type: 'error', message: 'Please enter your email.' });
            return;
        }
        setLoading(true);
        setStatus({ type: '', message: '' });
        try {
            const res = await fetch(`${API_BASE}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
                setEmail('');
            } else {
                setStatus({ type: 'error', message: data.error || 'Something went wrong.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.brandCol}>
                        <img src={logo} alt="ALTAIRGO INTELLIGENCE" className={styles.brandLogo} />
                        <p className={styles.brandDesc}>
                            Curating the world's most extraordinary journeys. Join our<br />
                            community of explorers and discover the unseen. Your next<br />
                            story starts here.
                        </p>
                        <div className={styles.socials}>
                            <a href="https://altairgo.com" className={styles.socialLink} aria-label="Website" target="_blank" rel="noopener noreferrer"><Globe size={16} /></a>
                            <a href="https://instagram.com/altairgo" className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={16} /></a>
                            <a href="mailto:contact@altairgo.com" className={styles.socialLink} aria-label="Mail"><Mail size={16} /></a>
                        </div>
                    </div>

                    <div className={styles.linksGroup}>
                        <div className={styles.linksCol}>
                            <h3 className={styles.colTitle}>Company</h3>
                            <Link to="/about" className={styles.footerLink}>About Us</Link>
                            <Link to="/careers" className={styles.footerLink}>Careers</Link>
                            <Link to="/press" className={styles.footerLink}>Press</Link>
                            <Link to="/partners" className={styles.footerLink}>Partners</Link>
                        </div>

                        <div className={styles.linksCol}>
                            <h3 className={styles.colTitle}>Support</h3>
                            <Link to="/help" className={styles.footerLink}>Help Center</Link>
                            <Link to="/safety" className={styles.footerLink}>Safety</Link>
                            <Link to="/cancellation" className={styles.footerLink}>Cancellation</Link>
                            <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.newsletterSection}>
                    <div className={styles.newsletterContent}>
                        <h3 className={styles.newsletterTitle}>Unlock the World</h3>
                        <p className={styles.newsletterDesc}>Get curated itineraries and travel secrets delivered to your inbox.</p>
                    </div>
                    <form className={styles.form} onSubmit={handleSubscribe}>
                        <div className={styles.inputGroup}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </div>
                        {status.message && (
                            <p className={status.type === 'success' ? styles.successMsg : styles.errorMsg}>
                                {status.message}
                            </p>
                        )}
                    </form>
                </div>

                <div className={styles.bottomSection}>
                    <p>© 2025 ALTAIRGO INTELLIGENCE. All rights reserved.</p>
                    <div className={styles.legalLinks}>
                        <Link to="/terms" className={styles.legalLink}>Terms of Service</Link>
                        <Link to="/privacy" className={styles.legalLink}>Privacy Policy</Link>
                        <Link to="/cookies" className={styles.legalLink}>Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

