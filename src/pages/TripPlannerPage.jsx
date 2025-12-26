import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, MapPin, Star, Sparkles, ExternalLink, Calendar, Users } from 'lucide-react';
import { destinationsData } from '../data/destinations';
import { TripAI } from '../services/TripAI';
import styles from './TripPlanner.module.css';

// Mock Data for Countries
const countries = [
    { id: 'ph', name: 'Philippines', image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=800', available: true },
    { id: 'in', name: 'India', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800', available: true },
    { id: 'vn', name: 'Vietnam', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800', available: true },
    { id: 'th', name: 'Thailand', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800', available: true },
];

const getStatesForCountry = (countryId) => {
    // Filter destinations by the selected country ID
    const countryDestinations = destinationsData.filter(d => d.country === countryId);

    // Get unique locations (states/regions) from these destinations
    const uniqueLocations = [...new Set(countryDestinations.map(d => d.location))];

    return uniqueLocations.map(loc => {
        // Find a representative destination for this location to get an image
        const rep = countryDestinations.find(d => d.location === loc);
        return {
            id: loc,
            name: loc,
            image: rep ? rep.image : '',
            desc: `${countryDestinations.filter(d => d.location === loc).length} Destinations`
        };
    });
};

const TripPlannerPage = () => {
    const [step, setStep] = useState(1);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedStates, setSelectedStates] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [budget, setBudget] = useState(0);
    const [insight, setInsight] = useState(null);

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

    const renderStep1 = () => (
        <>
            <h2 className={styles.title}>Where to?</h2>
            <p className={styles.subtitle}>Select a country to start planning your adventure.</p>

            <div className={styles.grid} style={{ marginTop: '3rem' }}>
                {countries.map(country => (
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
                    className={styles.nextBtn}
                    disabled={!selectedCountry || !countries.find(c => c.id === selectedCountry)?.available}
                    onClick={() => setStep(2)}
                >
                    Next Step <ChevronRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                </button>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h2 className={styles.title}>Select Regions</h2>
            <p className={styles.subtitle}>Which places would you like to visit? You can select multiple.</p>

            <div className={styles.grid} style={{ marginTop: '3rem' }}>
                {availableStates.map(state => (
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
                    className={styles.nextBtn}
                    disabled={selectedStates.length === 0}
                    onClick={() => setStep(3)}
                >
                    Next Step <ChevronRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                </button>
            </div>
        </>
    );

    const renderStep3 = () => {
        const filtered = destinationsData.filter(d => selectedStates.includes(d.location));
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

            </div>
        </div>
    );
};

export default TripPlannerPage;
