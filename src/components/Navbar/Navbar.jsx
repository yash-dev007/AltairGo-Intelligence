
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { Menu, X, Search } from 'lucide-react';

import logo from '../../assets/logo.png'; // Import Logo

import { API_BASE_URL } from '../../config';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Helper to handle navigation:
    // If on Home page ('/'), scroll to ID.
    // If on other pages, go to Home then ID (simple approach: just Link to /#id)
    // Note: Standard anchor tags with /#id work well with React Router for this if HashLink isn't used.
    // However, to ensure smooth scrolling on the same page, we need to handle it.

    const [searchQuery, setSearchQuery] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch destinations for search
    React.useEffect(() => {
        fetch(`${API_BASE_URL}/destinations`)
            .then(res => res.json())
            .then(data => setDestinations(data))
            .catch(err => console.error("Failed to fetch destinations for search:", err));
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            const filtered = destinations.filter(dest =>
                dest.name.toLowerCase().includes(query.toLowerCase()) ||
                dest.location.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredDestinations(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };



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
                    {/* Efficient Hybrid Approach: */}
                    {isHome ? (
                        <>
                            <a href="#about" className={styles.link} onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About Us</a>
                        </>
                    ) : (
                        <>
                            <Link to="/#about" className={styles.link} onClick={() => setIsOpen(false)}>About Us</Link>
                        </>
                    )}

                    <Link to="/destinations" className={styles.link} onClick={() => setIsOpen(false)}>Destinations</Link>

                    <Link to="/packages" className={styles.link} onClick={() => setIsOpen(false)}>Packages</Link>
                    <Link to="/blogs" className={styles.link} onClick={() => setIsOpen(false)}>Blogs</Link>

                    {/* Mobile Only: Book Button in Menu */}
                    <Link to="/booking" className={`${styles.bookBtn} ${styles.mobileBtnOnly} `} onClick={() => setIsOpen(false)}>Book now</Link>
                </div>



                {/* Search Bar (Desktop) */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <Search
                            className={styles.searchIcon}
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => { if (searchQuery) setShowSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                    </div>

                    {showSuggestions && filteredDestinations.length > 0 && (
                        <div className={styles.searchResults}>
                            {filteredDestinations.map(dest => (
                                <Link
                                    to={`/destinations/${dest.id}`}
                                    className={styles.searchResultItem}
                                    key={dest.id}
                                    onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                                >
                                    <div className={styles.resultImage}>
                                        <img src={dest.image} alt={dest.name} />
                                    </div>
                                    <div className={styles.resultInfo}>
                                        <span className={styles.resultName}>{dest.name}</span>
                                        <span className={styles.resultLocation}>{dest.location}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA (Desktop) */}
                <Link to="/booking" className={`${styles.bookBtn} ${styles.desktopBtn} `}>Book now</Link>
            </div>
        </nav>
    );
};

export default Navbar;
