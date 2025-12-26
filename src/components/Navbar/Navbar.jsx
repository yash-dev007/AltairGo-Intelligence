
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { Menu, X } from 'lucide-react';

import logo from '../../assets/logo.png'; // Import Logo

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Helper to handle navigation:
    // If on Home page ('/'), scroll to ID.
    // If on other pages, go to Home then ID (simple approach: just Link to /#id)
    // Note: Standard anchor tags with /#id work well with React Router for this if HashLink isn't used.
    // However, to ensure smooth scrolling on the same page, we need to handle it.

    const isHome = location.pathname === '/';

    const handleNavClick = (id) => {
        setIsOpen(false);
        if (isHome && id) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <div className={styles.logo}>
                    <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                        <img src={logo} alt="ALTAIRGO INTELLIGENCE" className={styles.logoImg} />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Links */}
                <div className={`${styles.links} ${isOpen ? styles.active : ''} `}>
                    <Link to={isHome ? "#home" : "/"} className={styles.link} onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }}>Home</Link>

                    {/* For sections on Home page, we use standard anchors if on home, or Link to /#id if not. 
                        But since we want smooth scrolling via JS on Home, we use span/button style or prevent default.
                        Simplest robust way for mixed nav: Use Link with hash, but React Router v6 needs setup for scroll.
                        We'll stick to simple Links that redirect to "/" for now for sections.
                    */}

                    {/* Efficient Hybrid Approach: */}
                    {isHome ? (
                        <>
                            <a href="#about" className={styles.link} onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About Us</a>
                            <a href="#destinations" className={styles.link} onClick={(e) => { e.preventDefault(); handleNavClick('destinations'); }}>Destinations</a>
                        </>
                    ) : (
                        <>
                            <Link to="/#about" className={styles.link} onClick={() => setIsOpen(false)}>About Us</Link>
                            <Link to="/#destinations" className={styles.link} onClick={() => setIsOpen(false)}>Destinations</Link>
                        </>
                    )}

                    <Link to="/packages" className={styles.link} onClick={() => setIsOpen(false)}>Packages</Link>
                    <Link to="/blogs" className={styles.link} onClick={() => setIsOpen(false)}>Blogs</Link>

                    {/* Mobile Only: Book Button in Menu */}
                    <Link to="/booking" className={`${styles.bookBtn} ${styles.mobileBtnOnly} `} onClick={() => setIsOpen(false)}>Book now</Link>
                </div>



                {/* CTA (Desktop) */}
                <Link to="/booking" className={`${styles.bookBtn} ${styles.desktopBtn} `}>Book now</Link>
            </div>
        </nav>
    );
};

export default Navbar;
