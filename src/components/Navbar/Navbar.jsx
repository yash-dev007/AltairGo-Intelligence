
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { Menu, X, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

import logo from '../../assets/logo_corrected.png'; // Import Corrected Logo

import { API_BASE_URL } from '../../config';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

                    {user ? (
                        <>

                            <button
                                onClick={() => { logout(); setIsOpen(false); navigate('/'); }}
                                className={`${styles.link} ${styles.mobileBtnOnly}`}
                                style={{ background: 'transparent', border: 'none', color: '#dc2626', textAlign: 'left', paddingLeft: 0, fontSize: '1.5rem' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        /* Mobile Only: Login Button in Menu */
                        <Link
                            to="/login"
                            className={`${styles.bookBtn} ${styles.mobileBtnOnly}`}
                            onClick={() => setIsOpen(false)}
                            style={{
                                color: 'var(--primary)',
                                background: 'white',
                                border: '2px solid var(--primary)',
                                marginBottom: '-1rem'
                            }}
                        >
                            Login/Register
                        </Link>
                    )}

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
                <div className={styles.desktopBtn} style={{ gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#334155', fontWeight: '600', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '50px' }}>
                            <User size={18} />
                            {user.name.split(' ')[0]}
                        </Link>
                    ) : (
                        <Link to="/login" style={{ textDecoration: 'none', color: '#334155', fontWeight: '600', fontSize: '0.95rem' }}>
                            Login
                        </Link>
                    )}
                    <Link to="/booking" className={styles.bookBtn}>Book now</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
