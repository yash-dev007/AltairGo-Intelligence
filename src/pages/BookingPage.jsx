import React, { useState, useRef } from 'react';
import { MapPin, Calendar, User, Search, Plane } from 'lucide-react';
import styles from './BookingPage.module.css';
import beachVideo from '../assets/videos/beach_video.mp4';

const BookingPage = () => {
    const [activeTab, setActiveTab] = useState('Hostelry');
    const [activeFilter, setActiveFilter] = useState('Popular destination');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [priceRange, setPriceRange] = useState(1000);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const widgetRef = useRef(null);

    const scrollToWidget = () => {
        widgetRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
                    {[
                        {
                            title: 'SC, Mindanou',
                            location: 'Mindanou, Philippines',
                            image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=2574&auto=format&fit=crop', // Lake/Mountain
                            discount: '20% OFF'
                        },
                        {
                            title: 'Disneyland Tokyo',
                            location: 'Tokyo, Japan',
                            image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?q=80&w=2574&auto=format&fit=crop', // Tokyo Disney/Castle vibe
                            discount: '20% OFF'
                        },
                        {
                            title: 'Tousand Island',
                            location: 'Java, Indonesia',
                            image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=3200&auto=format&fit=crop', // Tropical Island beach
                            discount: '20% OFF'
                        },
                        {
                            title: 'Basilika Santo',
                            location: 'Venice, Italy',
                            image: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=2667&auto=format&fit=crop', // Venice
                            discount: '20% OFF'
                        }
                    ].map((place, index) => (
                        <div key={index} className={styles.placeCard}>
                            <div className={styles.imageWrapper}>
                                <img src={place.image} alt={place.title} className={styles.placeImage} />
                            </div>
                            <h3 className={styles.placeTitle}>{place.title}</h3>
                            <div className={styles.placeLocation}>
                                <MapPin size={16} className={styles.locationIcon} />
                                <span>{place.location}</span>
                            </div>
                        </div>
                    ))}
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
                                onClick={() => setActiveFilter(filter)}
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
                                        <label><input type="checkbox" /> Adventure</label>
                                        <label><input type="checkbox" /> Relaxation</label>
                                        <label><input type="checkbox" /> Cultural</label>
                                    </div>
                                </div>
                            </div>
                            <button className={styles.applyFilterBtn} onClick={() => setShowFilterModal(false)}>Apply Filters</button>
                        </div>
                    </div>
                )}

                {/* Explore Grid */}
                <div className={styles.exploreGrid}>
                    {[
                        {
                            title: 'Amalfi Coast',
                            location: 'Amalfi, Italy',
                            price: '$148',
                            rating: '4.9',
                            image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=2670&auto=format&fit=crop'
                        },
                        {
                            title: 'Taj Mahal',
                            location: 'Agra, India',
                            price: '$140',
                            rating: '4.9',
                            image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2671&auto=format&fit=crop'
                        },
                        {
                            title: 'Tanah Gajah',
                            location: 'Bali, Indonesia',
                            price: '$148',
                            rating: '4.9',
                            image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2670&auto=format&fit=crop'
                        },
                        {
                            title: 'Osaka Castle',
                            location: 'Osaka, Japan',
                            price: '$156',
                            rating: '4.9',
                            image: 'https://images.unsplash.com/photo-1742702330506-5ffbd0419901?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b3Nha2ElMjBjYXN0ZWx8ZW58MHx8MHx8fDI%3D'
                        },
                        {
                            title: 'Cape Reinga',
                            location: 'Northland, New Zealand',
                            price: '$164',
                            rating: '4.9',
                            image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?q=80&w=2670&auto=format&fit=crop'
                        },
                        {
                            title: 'Sorrento, Italy',
                            location: 'Amalfi, Italy',
                            price: '$172',
                            rating: '4.9',
                            image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2574&auto=format&fit=crop'
                        }
                    ].map((item, index) => (
                        <div key={index} className={styles.exploreCard}>
                            <div className={styles.exploreImageWrapper}>
                                <img src={item.image} alt={item.title} className={styles.exploreImage} />
                            </div>
                            <div className={styles.exploreContent}>
                                <div className={styles.exploreInfo}>
                                    <h3 className={styles.exploreTitle}>{item.title}</h3>
                                    <div className={styles.exploreLocation}>
                                        <MapPin size={14} className={styles.locationIcon} />
                                        <span>{item.location}</span>
                                    </div>
                                </div>
                                <div className={styles.explorePrice}>
                                    <span className={styles.priceValue}>{item.price}</span>
                                    <span className={styles.priceUnit}>/Pax</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.showMoreContainer}>
                    <button className={styles.showMoreBtn}>Show more</button>
                </div>
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
