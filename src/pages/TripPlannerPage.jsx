import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, MapPin, Star, Sparkles, ExternalLink, Calendar, Users, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { TripAI } from '../services/TripAI';
import styles from './TripPlanner.module.css';

const TripPlannerPage = () => {
    const [step, setStep] = useState(1);
    const [countries, setCountries] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedStates, setSelectedStates] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [budget, setBudget] = useState(0);
    const [insight, setInsight] = useState(null);

    // Search States
    const [countrySearch, setCountrySearch] = useState('');
    const [regionSearch, setRegionSearch] = useState('');
    const [destSearch, setDestSearch] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesRes, destsRes, regionsRes] = await Promise.all([
                    fetch('http://127.0.0.1:5000/countries'),
                    fetch('http://127.0.0.1:5000/destinations'),
                    fetch('http://127.0.0.1:5000/regions')
                ]);
                const countriesData = await countriesRes.json();
                const destsData = await destsRes.json();
                const regionsData = await regionsRes.json();

                const enrichedCountries = countriesData.map(c => ({
                    ...c,
                    id: c.code, // Map code to id for frontend compatibility
                    available: true // Assuming all in DB are available
                }));

                setCountries(enrichedCountries);
                setDestinations(destsData);
                setRegions(regionsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const getStatesForCountry = (countryId) => {
        // Find component country to get fallback image
        const countryObj = countries.find(c => c.id === countryId);
        const fallbackImg = countryObj ? countryObj.image : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800';

        // Filter regions by the selected country ID
        const countryRegions = regions.filter(r => r.country === countryId);

        return countryRegions.map(region => {
            // Find a representative destination for this region to get an image
            // We match destination.location (which is the region name) with region.name
            const rep = destinations.find(d => d.location === region.name);
            const count = destinations.filter(d => d.location === region.name).length;

            // Prioritize explicit region image, then representative destination, then fallback
            let imgUrl = region.image || (rep ? rep.image : fallbackImg);

            return {
                id: region.name, // Keeping ID as name for compatibility with existing logic
                name: region.name,
                image: imgUrl,
                desc: `${count} Destinations`
            };
        });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    useEffect(() => {
        if (selectedCountry) {
            setAvailableStates(getStatesForCountry(selectedCountry));
            setSelectedStates([]);
            setSelectedDestinations([]);
        }
    }, [selectedCountry]);

    // Fetch budget and insights when entering Step 4
    useEffect(() => {
        if (step === 4 && itinerary.length > 0) {
            const fetchAIInsights = async () => {
                const b = await TripAI.calculateBudget(itinerary);
                const i = await TripAI.getSmartInsight(itinerary);
                setBudget(b);
                setInsight(i);
            };
            fetchAIInsights();
        }
    }, [step, itinerary]);

    const handleStateToggle = (stateId) => {
        if (selectedStates.includes(stateId)) {
            setSelectedStates(selectedStates.filter(id => id !== stateId));
        } else {
            setSelectedStates([...selectedStates, stateId]);
        }
    };

    const handleDestinationToggle = (destId) => {
        if (selectedDestinations.includes(destId)) {
            setSelectedDestinations(selectedDestinations.filter(id => id !== destId));
        } else {
            setSelectedDestinations([...selectedDestinations, destId]);
        }
    };

    const generateItinerary = async () => {
        setLoading(true);
        // Use the AI Service to generate the plan (Async)
        try {
            const plan = await TripAI.generateItinerary(selectedDestinations);
            setItinerary(plan);
            setLoading(false);
            setStep(4);
        } catch (error) {
            console.error("Failed to generate itinerary", error);
            setLoading(false);
            alert("Connection to AI Backend failed. Please ensure the Python server is running.");
        }
    };

    const renderStep1 = () => {
        const filteredCountries = countries.filter(c =>
            c.name.toLowerCase().includes(countrySearch.trim().toLowerCase())
        );

        return (
            <>
                <h2 className={styles.title}>Where to?</h2>
                <p className={styles.subtitle}>Select a country to start planning your adventure.</p>

                <div className={styles.searchSection}>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search size={20} className={styles.searchIcon} />
                    </div>
                    <div className={styles.countBadge}>
                        <Check size={16} strokeWidth={3} />
                        {filteredCountries.length} Countries
                    </div>
                </div>

                <div className={styles.grid} style={{ marginTop: '1rem' }}>
                    {filteredCountries.map(country => (
                        <div
                            key={country.id}
                            className={`${styles.card} ${selectedCountry === country.id ? styles.selected : ''}`}
                            onClick={() => setSelectedCountry(country.id)}
                            style={{ opacity: country.available ? 1 : 0.6 }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={country.image} alt={country.name} className={styles.cardImage} />
                                {selectedCountry === country.id && <div className={styles.checkIcon}><Check size={16} /></div>}
                                {!country.available && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                    }}>
                                        Coming Soon
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>{country.name}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                    <button
                        id="next-step-btn"
                        className={styles.nextBtn}
                        disabled={!selectedCountry || !countries.find(c => c.id === selectedCountry)?.available}
                        onClick={() => {
                            setStep(2);
                            setCountrySearch(''); // Optional: clear search on next step
                        }}
                    >
                        Next Step <ChevronRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                    </button>
                </div>
            </>
        );
    };

    const renderStep2 = () => {
        const filteredStates = availableStates.filter(s =>
            s.name.toLowerCase().includes(regionSearch.trim().toLowerCase())
        );

        return (
            <>
                <h2 className={styles.title}>Select Regions</h2>
                <p className={styles.subtitle}>Which places would you like to visit? You can select multiple.</p>

                <div className={styles.searchSection}>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search regions..."
                            value={regionSearch}
                            onChange={(e) => setRegionSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search size={20} className={styles.searchIcon} />
                    </div>
                    <div className={styles.countBadge}>
                        <MapPin size={16} strokeWidth={3} />
                        {filteredStates.length} Regions
                    </div>
                </div>

                {/* Numbered Selection Section for Regions */}
                {selectedStates.length > 0 && (
                    <div className={styles.selectionSection}>
                        <div className={styles.selectionHeader}>
                            <span>Your Selections ({selectedStates.length})</span>
                            <span style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setSelectedStates([])}>Clear All</span>
                        </div>
                        <div className={styles.selectionList}>
                            {selectedStates.map((id, idx) => {
                                const item = availableStates.find(s => s.id === id);
                                return item ? (
                                    <div key={id} className={styles.selectionChip}>
                                        <span className={styles.index}>{idx + 1}</span>
                                        {item.name}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                <div className={styles.grid} style={{ marginTop: '1rem' }}>
                    {filteredStates.map(state => (
                        <div
                            key={state.id}
                            className={`${styles.card} ${selectedStates.includes(state.id) ? styles.selected : ''}`}
                            onClick={() => handleStateToggle(state.id)}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={state.image} alt={state.name} className={styles.cardImage} />
                                {selectedStates.includes(state.id) && <div className={styles.checkIcon}><Check size={16} /></div>}
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>{state.name}</div>
                                <div className={styles.cardDesc}>{state.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep(1)}>
                        <ChevronLeft size={18} /> Back
                    </button>
                    <button
                        id="next-step-btn"
                        className={styles.nextBtn}
                        disabled={selectedStates.length === 0}
                        onClick={() => {
                            setStep(3);
                            setRegionSearch('');
                        }}
                    >
                        Next Step <ChevronRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                    </button>
                </div>
            </>
        );
    };

    const renderStep3 = () => {
        // First filter by selected regions
        const regionFiltered = destinations.filter(d => selectedStates.includes(d.location));
        // Then filter by search query
        const filtered = regionFiltered.filter(d =>
            d.name.toLowerCase().includes(destSearch.trim().toLowerCase()) ||
            d.desc.toLowerCase().includes(destSearch.trim().toLowerCase())
        );

        const trending = filtered.filter(d => d.rating >= 4.8);
        const others = filtered.filter(d => d.rating < 4.8);

        const DestinationCard = ({ dest }) => (
            <div
                className={`${styles.card} ${selectedDestinations.includes(dest.id) ? styles.selected : ''}`}
                onClick={() => handleDestinationToggle(dest.id)}
            >
                <div style={{ position: 'relative' }}>
                    <img src={dest.image} alt={dest.name} className={styles.cardImage} />
                    {selectedDestinations.includes(dest.id) && <div className={styles.checkIcon}><Check size={16} /></div>}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={12} fill="#fbbf24" color="#fbbf24" /> {dest.rating}
                    </div>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.tagsRow}>
                        <span className={styles.tagBadge}>{dest.tag}</span>
                        <span className={styles.crowdBadge} data-level={dest.crowdLevel}>
                            <Users size={12} strokeWidth={2.5} />
                            {dest.crowdLevel === 'High' ? 'Busy (Book Ahead)' : dest.crowdLevel === 'Low' ? 'Quiet & Relaxing' : 'Moderate Crowd'}
                        </span>
                    </div>
                    <div className={styles.cardTitle}>{dest.name}</div>
                    <div className={styles.cardDesc} style={{ marginBottom: '1rem' }}>
                        {dest.desc}
                    </div>
                    {/* View Details Button that stops propagation to prevent selection toggle when clicked */}
                    <a
                        href={`/destinations/${dest.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewDetailsBtn}
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Details <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        );

        return (
            <>
                <h2 className={styles.title}>Pick your Destinations</h2>
                <p className={styles.subtitle}>Select the specific spots you want to include in your trip.</p>

                <div className={styles.searchSection}>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search destinations..."
                            value={destSearch}
                            onChange={(e) => setDestSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search size={20} className={styles.searchIcon} />
                    </div>
                    <div className={styles.countBadge}>
                        <Sparkles size={16} strokeWidth={3} />
                        {filtered.length} Open
                    </div>
                </div>

                {/* Numbered Selection Section for Destinations */}
                {selectedDestinations.length > 0 && (
                    <div className={styles.selectionSection}>
                        <div className={styles.selectionHeader}>
                            <span>Your Itinerary List ({selectedDestinations.length})</span>
                            <span style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setSelectedDestinations([])}>Clear All</span>
                        </div>
                        <div className={styles.selectionList}>
                            {selectedDestinations.map((id, idx) => {
                                const item = destinations.find(d => d.id === id);
                                return item ? (
                                    <div key={id} className={styles.selectionChip}>
                                        <span className={styles.index}>{idx + 1}</span>
                                        {item.name}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {destSearch ? (
                    <div className={styles.grid}>
                        {filtered.map(dest => <DestinationCard key={dest.id} dest={dest} />)}
                    </div>
                ) : (
                    <>
                        {trending.length > 0 && (
                            <>
                                <div className={styles.sectionHeader}><Sparkles size={20} color="#fbbf24" /> Trending in your regions</div>
                                <div className={styles.grid}>
                                    {trending.map(dest => <DestinationCard key={dest.id} dest={dest} />)}
                                </div>
                            </>
                        )}

                        {others.length > 0 && (
                            <>
                                <div className={styles.sectionHeader}><MapPin size={20} color="#64748b" /> Explore More</div>
                                <div className={styles.grid}>
                                    {others.map(dest => <DestinationCard key={dest.id} dest={dest} />)}
                                </div>
                            </>
                        )}
                    </>
                )}

                <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep(2)}>
                        <ChevronLeft size={18} /> Back
                    </button>
                    <button
                        className={styles.nextBtn}
                        disabled={selectedDestinations.length === 0}
                        onClick={generateItinerary}
                    >
                        {loading ? 'Consulting AI Agent...' : 'Generate AI Plan'} <Sparkles size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                    </button>
                </div>
            </>
        );
    };

    const renderStep4 = () => {
        return (
            <>
                <h2 className={styles.title}>Your Smart Itinerary</h2>
                <p className={styles.subtitle}>An optimized travel plan curated just for you.</p>

                <div className={styles.itineraryContainer} style={{ maxWidth: '1000px', padding: '0 1rem' }}>
                    {/* Budget & Smart Summary */}
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Duration</span>
                            <span className={styles.summaryValue}>{itinerary[itinerary.length - 1]?.day || 0} Days</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Est. Budget</span>
                            <span className={styles.summaryValue}>
                                ₱{budget.toLocaleString()}
                            </span>
                        </div>
                        {insight && (
                            <div className={styles.smartInsight}>
                                <Sparkles size={20} style={{ minWidth: '20px' }} />
                                <div>
                                    <strong>Smart Insight:</strong> {insight.text}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.itineraryContainer}>
                    {itinerary.map((item, index) => (
                        <div key={index} className={styles.dayCard}>
                            <div className={styles.dayMarker}>
                                {item.day}
                            </div>
                            <div className={styles.dayTitle}>Day {item.day} : {item.location}</div>
                            <div className={styles.activityItem}>
                                <div className={styles.activityTime}>All Day</div>
                                <div className={styles.activityContent}>
                                    <h4>{item.activities}</h4>
                                    <p>Explore the best of {item.location}. Don't miss the local highlights!</p>
                                </div>
                            </div>
                            {/* Optional: Add booking CTA per day if needed */}
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep(3)}>
                        <ChevronLeft size={18} /> Modify
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className={styles.nextBtn} style={{ background: 'white', color: 'var(--text-main)', border: '1px solid #e2e8f0' }}>
                            <Calendar size={18} style={{ display: 'inline', marginRight: '5px' }} /> Save Plan
                        </button>
                        <Link to="/booking" className={styles.nextBtn} style={{ textDecoration: 'none' }}>
                            Book This Trip
                        </Link>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>

                {/* Progress Indicators */}
                <div className={styles.progressContainer}>
                    <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>1</div>
                    <div className={`${styles.stepLine} ${step > 1 ? styles.filled : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>2</div>
                    <div className={`${styles.stepLine} ${step > 2 ? styles.filled : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 3 ? styles.active : ''} ${step > 3 ? styles.completed : ''}`}>3</div>
                    <div className={`${styles.stepLine} ${step > 3 ? styles.filled : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 4 ? styles.active : ''}`}>4</div>
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                {/* Floating Scroll Button */}
                {(step === 1 || step === 2) && (
                    <button
                        className={styles.floatingBtn}
                        onClick={() => {
                            if (window.scrollY > 300) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                const nextBtn = document.getElementById('next-step-btn');
                                if (nextBtn) {
                                    nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                } else {
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }
                            }
                        }}
                        title={window.scrollY > 300 ? "Scroll to Top" : "Scroll to Next Step"}
                    >
                        <ScrollIcon />
                    </button>
                )}

            </div>
        </div>
    );
};

// Helper component for the icon to avoid re-rendering the whole page on scroll
const ScrollIcon = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return isScrolled ? <ArrowUp size={24} /> : <ArrowDown size={24} />;
};

export default TripPlannerPage;
