import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, User, Search, Plane } from 'lucide-react';
import styles from './BookingPage.module.css';
import beachVideo from '../../assets/videos/beach_video.mp4';
import { API_BASE_URL } from '../../config';
import DestinationCard from '../../components/DestinationCard/DestinationCard';

const BookingPage = () => {
    const [activeTab, setActiveTab] = useState('Hostelry');
    const [activeFilter, setActiveFilter] = useState('Popular destination');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [priceRange, setPriceRange] = useState(1000);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const [isPlaying, setIsPlaying] = useState(false);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const widgetRef = useRef(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/destinations`)
            .then(res => res.json())
            .then(data => {
                setDestinations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch destinations:", err);
                setLoading(false);
            });
    }, []);

    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // Filter Logic
    const filteredDestinations = destinations.filter(dest => {
        // 1. Tab Filter (Keyword match)
        if (activeFilter !== 'Popular destination') {
            const keyword = activeFilter.toLowerCase();
            const matchesKeyword =
                dest.name.toLowerCase().includes(keyword) ||
                dest.desc.toLowerCase().includes(keyword) ||
                dest.location.toLowerCase().includes(keyword);
            if (!matchesKeyword) return false;
        }

        // 2. Price Filter
        if (dest.estimated_cost_per_day > priceRange) return false;

        // 3. Type Filter (Adventure, Relaxation, etc.)
        if (selectedTypes.length > 0) {
            const desc = dest.desc.toLowerCase();
            const matchesType = selectedTypes.some(type => {
                if (type === 'Adventure') return desc.includes('adventure') || desc.includes('hike') || desc.includes('mountain');
                if (type === 'Relaxation') return desc.includes('relax') || desc.includes('beach') || desc.includes('spa');
                if (type === 'Cultural') return desc.includes('culture') || desc.includes('temple') || desc.includes('history') || desc.includes('art');
                return false;
            });
            if (!matchesType) return false;
        }

        return true;
    });

    const scrollToWidget = () => {
        widgetRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ... existing handlePlayVideo ...

    const handlePlayVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // ... render ...


    return (
        <div className={styles.pageContainer}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                `}
            </style>

            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        <span style={{ color: '#4ade80' }}>Explore</span> the whole world<br />
                        and enjoy its beauty
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Find and write about your experiences around the world.
                    </p>
                </div>

                {/* Decorative Flight Paths with Plane Icons */}
                <div className={styles.flightPathLeft}>
                    <Plane className={styles.planeIconLeft} size={24} fill="white" />
                </div>
                <div className={styles.flightPathRight}>
                    <Plane className={styles.planeIconRight} size={24} fill="white" />
                </div>
            </div>

            {/* Floating Booking Widget */}
            <div className={styles.widgetContainer} ref={widgetRef}>
                <div className={styles.widgetCard}>
                    {/* Tabs */}
                    <div className={styles.widgetHeader}>
                        <div className={styles.tabs}>
                            {['Hostelry', 'Flights', 'Bus & Shuttle', 'Cars'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                    </div>

                    {/* Inputs */}
                    <div className={styles.searchForm}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Destination</label>
                            <div className={styles.inputField}>
                                <MapPin size={20} className={styles.inputIcon} />
                                <input type="text" placeholder="Bali, Indonesia" defaultValue="Bali, Indonesia" />
                            </div>
                        </div>

                        <div className={styles.dividerVertical}></div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Check-in</label>
                            <div className={styles.inputField}>
                                <Calendar size={20} className={styles.inputIcon} />
                                <input type="text" placeholder="Sat, 2 Dec 2022" defaultValue="Sat, 2 Dec 2022" />
                            </div>
                        </div>

                        <div className={styles.dividerVertical}></div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Check-out</label>
                            <div className={styles.inputField}>
                                <Calendar size={20} className={styles.inputIcon} />
                                <input type="text" placeholder="Sun, 3 Dec 2022" defaultValue="Sun, 3 Dec 2022" />
                            </div>
                        </div>

                        <div className={styles.dividerVertical}></div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Room & Guest</label>
                            <div className={styles.inputField}>
                                <User size={20} className={styles.inputIcon} />
                                <input type="text" placeholder="1 Room, 2 Guest" defaultValue="1 Room, 2 Guest" />
                            </div>
                        </div>

                        <button className={styles.searchButton}>
                            <Search size={22} className={styles.searchIcon} />
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Popular Place Section */}
            <section className={styles.popularSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.sectionTitle}>Popular Place</h2>
                        <p className={styles.sectionSubtitle}>Let's enjoy this heaven on earth</p>
                    </div>
                    <div className={styles.headerRight}>
                        <p className={styles.sectionDescription}>
                            Many places are very famous, beautiful, clean, and will give a very deep impression to visitors and will make them come back.
                        </p>
                    </div>
                </div>

                <div className={styles.placesGrid}>
                    {loading ? (
                        Array(4).fill(0).map((_, index) => (
                            <div key={index} className={styles.skeleton} />
                        ))
                    ) : (
                        destinations.slice(0, 4).map((dest) => (
                            <DestinationCard key={dest.id} dest={dest} />
                        ))
                    )}
                </div>
            </section>

            {/* Sweet Memories Section */}
            <section className={styles.memoriesSection}>
                <div className={styles.memoriesHeader}>
                    <h2 className={styles.memoriesTitle}>Travel to make sweet memories</h2>
                    <p className={styles.memoriesSubtitle}>Find trips that fit a flexible lifestyle</p>
                </div>

                <div className={styles.memoriesContent}>
                    {/* Left Side - Features */}
                    <div className={styles.memoriesLeft}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureNumber}>01</div>
                            <div className={styles.featureText}>
                                <h3>Find trips that fit your freedom</h3>
                                <p>Travelling offers freedom and flexibility, solitude and spontaneity, privacy and purpose.</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureNumber}>02</div>
                            <div className={styles.featureText}>
                                <h3>Get back to nature by travel</h3>
                                <p>The world is a playground and you can finally explore Mother Nature's inimitable canvas.</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureNumber}>03</div>
                            <div className={styles.featureText}>
                                <h3>Reignite those travel tastebuds</h3>
                                <p>There are infinite reasons to love travel, one of them being the glorious food.</p>
                            </div>
                        </div>

                    </div>

                    {/* Right Side - Image with Floating Cards */}
                    <div className={styles.memoriesRight}>
                        <div className={styles.memoriesImageWrapper}>
                            <img
                                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
                                alt="Scenic Mountain Landscape"
                                className={styles.memoriesMainImage}
                            />

                            {/* Floating Cards */}
                            <div className={`${styles.floatingCard} ${styles.card1}`}>
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="User" />
                                <div>
                                    <h4>Pranjal Chopade</h4>
                                    <span>⭐ 4.5</span>
                                </div>
                            </div>

                            <div className={`${styles.floatingCard} ${styles.card2}`}>
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="User" />
                                <div>
                                    <h4>Mohit Borse</h4>
                                    <span>⭐ 5.0</span>
                                </div>
                            </div>

                            <div className={`${styles.floatingCard} ${styles.card3}`}>
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" alt="User" />
                                <div>
                                    <h4>Bhushan Bhusare</h4>
                                    <span>⭐ 4.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Explore More Section */}
            <section className={styles.exploreSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.sectionTitle}>Explore more</h2>
                        <p className={styles.sectionSubtitle}>Let's go on an adventure</p>
                    </div>
                    {/* Description removed as per request */}
                    <div className={styles.headerRight}></div>
                </div>

                {/* Filters */}
                <div className={styles.filterContainer}>
                    <div className={styles.filterTags}>
                        {['Popular destination', 'Islands', 'Surfing', 'Nation parks', 'Lake', 'Beach', 'Camp'].map((filter, idx) => (
                            <button
                                key={idx}
                                className={`${styles.filterTag} ${activeFilter === filter ? styles.activeFilter : ''}`}
                                onClick={() => { setActiveFilter(filter); setVisibleCount(6); }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <button className={styles.filterBtn} onClick={() => setShowFilterModal(true)}>
                        Filters <span className={styles.filterIcon}>⚡</span>
                    </button>
                </div>

                {/* Filter Modal */}
                {showFilterModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>Filters</h3>
                                <button className={styles.closeBtn} onClick={() => setShowFilterModal(false)}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.filterGroup}>
                                    <label>Price Range</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        className={styles.rangeSlider}
                                    />
                                    <div className={styles.priceLabels}>
                                        <span>$50</span>
                                        <span>${priceRange}</span>
                                    </div>
                                </div>
                                <div className={styles.filterGroup}>
                                    <label>Type</label>
                                    <div className={styles.checkboxGroup}>
                                        {['Adventure', 'Relaxation', 'Cultural'].map(type => (
                                            <label key={type}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={() => toggleType(type)}
                                                /> {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button className={styles.applyFilterBtn} onClick={() => setShowFilterModal(false)}>Apply Filters</button>
                        </div>
                    </div>
                )}

                {/* Explore Grid */}
                <div className={styles.exploreGrid}>
                    {loading ? (
                        Array(6).fill(0).map((_, index) => (
                            <div key={index} className={styles.skeleton} />
                        ))
                    ) : (
                        <>
                            {filteredDestinations.length > 0 ? (
                                filteredDestinations.slice(0, visibleCount).map((dest) => (
                                    <DestinationCard key={dest.id} dest={dest} />
                                ))
                            ) : (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '5rem 2rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '1.5rem',
                                    border: '1px dashed #cbd5e1',
                                    gap: '1rem'
                                }}>
                                    <Search size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#334155', margin: 0 }}>
                                        No matches found
                                    </h3>
                                    <p style={{ fontSize: '1rem', color: '#64748b', textAlign: 'center', maxWidth: '400px' }}>
                                        We couldn't find any destinations matching your current filters. Try changing your selected category.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {filteredDestinations.length > visibleCount && (
                    <div className={styles.showMoreContainer}>
                        <button
                            className={styles.showMoreBtn}
                            onClick={() => setVisibleCount(prev => prev + 6)}
                        >
                            Show more
                        </button>
                    </div>
                )}
            </section>

            {/* Book Now Section */}
            <section className={styles.bookNowSection}>
                <div className={styles.bookNowHeader}>
                    <h2 className={styles.bookNowTitle}>Book tickets and go now!</h2>
                    <button className={styles.bookNowBtn} onClick={scrollToWidget}>Book now</button>
                </div>

                <div className={styles.videoContainer}>
                    <video
                        ref={videoRef}
                        className={styles.videoThumbnail}
                        poster="https://images.unsplash.com/photo-1544551763-46a8723ba3f9?q=80&w=2674&auto=format&fit=crop"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src={beachVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Play button removed as requested for autoplay loop */}
                </div>
            </section>
        </div>
    );
};

export default BookingPage;
