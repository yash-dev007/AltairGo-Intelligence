import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, MapPin, Star, Sparkles, ExternalLink, Calendar, Users, Search, ArrowUp, ArrowDown, X, Plus } from 'lucide-react';
import { TripAI } from '../services/TripAI';
import { API_BASE_URL } from '../config';
import AddDestinationModal from '../components/AddDestinationModal';
import DateSelectionModal from '../components/TripPlanner/DateSelectionModal';
import DestinationCard from '../components/TripPlanner/DestinationCard';
import ItineraryTimeline from '../components/TripPlanner/ItineraryTimeline';
import BudgetSelectionModal from '../components/TripPlanner/BudgetSelectionModal';
import AIDestinationDetailsModal from '../components/TripPlanner/AIDestinationDetailsModal';
import ChatWidget from '../components/ChatWidget/ChatWidget';
import styles from './TripPlanner.module.css';

const TripPlannerPage = () => {
    const [step, setStep] = useState(1);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedDetailDest, setSelectedDetailDest] = useState(null);

    // Trip Context
    const [tripContext, setTripContext] = useState({
        budget: 50000,
        days: 5,
        style: 'Standard'
    });
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
    const [visibleCount, setVisibleCount] = useState(24);
    const [aiRegionReasons, setAiRegionReasons] = useState({}); // { regionId: 'Reason...' }

    // Search States
    const [countrySearch, setCountrySearch] = useState('');
    const [regionSearch, setRegionSearch] = useState('');
    const [destSearch, setDestSearch] = useState('');
    const [startLocation, setStartLocation] = useState('Mumbai'); // Default
    const [isCustomLocation, setIsCustomLocation] = useState(false);

    // OSM Search State
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const START_LOCATIONS = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Hyderabad', 'Ahmedabad', 'Pune', 'Kochi', 'Jaipur'
    ];

    // Debounce helper for search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isCustomLocation && startLocation.length > 2) {
                fetchLocations(startLocation);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [startLocation, isCustomLocation]);

    const fetchLocations = async (query) => {
        if (!query) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
            const data = await res.json();
            setLocationSuggestions(data);
        } catch (err) {
            console.error("Location search failed", err);
        } finally {
            setIsSearching(false);
        }
    };

    // Date Selection State
    const [showDateModal, setShowDateModal] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [travelDates, setTravelDates] = useState({ start: null, end: null });

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesRes, destsRes, regionsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/countries`),
                    fetch(`${API_BASE_URL}/destinations`),
                    fetch(`${API_BASE_URL}/regions`)
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

    // Lazy Load Data
    const [fetchingRegion, setFetchingRegion] = useState(false);

    useEffect(() => {
        if (step === 3 && selectedStates.length > 0) {
            checkAndFetchData();
        }
    }, [step, selectedStates]); // eslint-disable-line react-hooks/exhaustive-deps

    const checkAndFetchData = async () => {
        let stateId = selectedStates[0];
        if (!stateId) return;

        // FIX: If stateId is a Name (String), find the Numeric ID from regions list
        const regionObj = regions.find(r => r.id === stateId || r.name === stateId);
        if (regionObj) {
            // console.log(`Mapping State: ${stateId} -> ${regionObj.id}`);
            stateId = regionObj.id;
        }

        // Force fetch for debug
        const url = `${API_BASE_URL}/regions/${stateId}/populate`;
        // console.log("Fetching live data for ID:", stateId);
        setFetchingRegion(true);
        try {
            const res = await fetch(url, {
                method: 'POST'
            });

            const contentType = res.headers.get("content-type");


            if (contentType && contentType.includes("application/json")) {
                const result = await res.json();


                if (result.status === 'success' && result.data.length > 0) {
                    // Deduplicate before adding
                    setDestinations(prev => {
                        const existingIds = new Set(prev.map(d => d.name)); // name as unique key for now
                        const newItems = result.data.filter(d => !existingIds.has(d.name));
                        return [...prev, ...newItems];
                    });
                }
            } else {
                // It's HTML or Text (Error Page)
                const text = await res.text();
                console.error("Non-JSON Response:", text.substring(0, 100));

            }

        } catch (err) {
            console.error("Auto-population failed", err);

        } finally {
            setFetchingRegion(false);
        }
    };

    const getStatesForCountry = (countryId) => {
        if (!countries || !regions || !destinations) return [];

        // Find component country to get fallback image
        const countryObj = countries.find(c => c.id === countryId);
        // Safety: If country not found, use generic fallback
        const fallbackImg = (countryObj && countryObj.image) ? countryObj.image : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800';

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
    }, [selectedCountry]); // eslint-disable-line react-hooks/exhaustive-deps

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

        // Prepare Preferences Context
        const countryObj = countries.find(c => c.id === selectedCountry);
        const userPreferences = {
            country: countryObj ? countryObj.name : 'Unknown',
            duration: travelDates.duration || tripContext.days || 5,
            month: travelDates.month ? travelDates.month.toLocaleString('default', { month: 'long' }) : 'Any',
            budget: tripContext.budget,
            style: tripContext.style
        };

        // If no destinations selected, we rely on the backend "Surprise Me" mode (empty list)
        // But if user manually selected, we send those.

        try {
            const plan = await TripAI.generateItinerary(selectedDestinations, userPreferences);
            setItinerary(plan);
            setLoading(false);
            setStep(4);
        } catch (error) {
            console.error("Failed to generate itinerary", error);
            setLoading(false);
            alert("Connection to AI Backend failed. Please ensure the Python server is running.");
        }
    };

    const handleDateApply = (dateData) => {
        // dateData = { type, start, end, duration, month }
        setTravelDates(dateData);
    };

    const renderStep1 = () => {
        const filteredCountries = countries.filter(c =>
            c.name.toLowerCase().includes(countrySearch.trim().toLowerCase())
        );

        return (
            <>
                <h2 className={styles.title}>Where to?</h2>
                <p className={styles.subtitle}>Select a country or territory to start planning your adventure.</p>

                {/* Start Location Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className={styles.sectionLabel}>
                        <MapPin size={16} style={{ color: 'var(--primary)' }} /> Starting from
                    </div>

                    {!isCustomLocation ? (
                        <div className={styles.locationScroll}>
                            <button
                                className={styles.locationChip}
                                style={{ borderStyle: 'dashed', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                onClick={() => {
                                    setIsCustomLocation(true);
                                    setStartLocation('');
                                }}
                            >
                                + Other
                            </button>
                            {START_LOCATIONS.map(loc => (
                                <button
                                    key={loc}
                                    className={`${styles.locationChip} ${startLocation === loc ? styles.active : ''}`}
                                    onClick={() => setStartLocation(loc)}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div className={styles.searchWrapper} style={{ margin: 0, flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder="Enter your city, town, or village..."
                                        value={startLocation}
                                        onChange={(e) => setStartLocation(e.target.value)}
                                        className={styles.searchInput}
                                        autoFocus
                                        style={{ paddingLeft: '1rem' }}
                                    />
                                    {isSearching && <div className={styles.loadingSpinner} />}
                                </div>
                                <button
                                    className={styles.locationChip}
                                    onClick={() => {
                                        setIsCustomLocation(false);
                                        setStartLocation('Mumbai');
                                        setLocationSuggestions([]);
                                    }}
                                >
                                    <X size={16} /> Cancel
                                </button>
                            </div>

                            {/* Suggestions Dropdown */}
                            {locationSuggestions.length > 0 && isCustomLocation && (
                                <div className={styles.suggestionsDropdown}>
                                    {locationSuggestions.map((place) => (
                                        <div
                                            key={place.place_id}
                                            className={styles.suggestionItem}
                                            onClick={() => {
                                                setStartLocation(place.display_name.split(',')[0]); // Use just the main name
                                                setLocationSuggestions([]); // Clear suggestions to close dropdown
                                                // Keep in custom mode
                                            }}
                                        >
                                            <MapPin size={14} color="#64748b" />
                                            <div>
                                                <strong>{place.display_name.split(',')[0]}</strong>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>
                                                    {place.display_name.split(',').slice(1).join(',')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.searchSection}>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        <Search size={20} className={styles.searchIcon} />
                    </div>
                    <div className={styles.countBadge}>
                        <Check size={16} strokeWidth={3} />
                        {filteredCountries.length} Locations
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
                                <img
                                    src={country.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'}
                                    alt={country.name}
                                    className={styles.cardImage}
                                />
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
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className={styles.secondaryBtn}
                            onClick={() => setBudgetModalOpen(true)}
                            style={{ border: '1px solid #cbd5e1' }}
                        >
                            <span style={{ marginRight: '5px' }}>💰</span> Set Budget
                        </button>
                        <button
                            className={styles.secondaryBtn}
                            onClick={() => setShowDateModal(true)}
                            style={{ border: '1px solid #cbd5e1' }}
                        >
                            <Calendar size={18} style={{ display: 'inline', marginRight: '5px' }} />
                            {(() => {
                                if (travelDates.type === 'flexible' && travelDates.month) {
                                    return `${travelDates.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} (${travelDates.duration} days)`;
                                }
                                if (travelDates.type === 'anytime') {
                                    return `Anytime (${travelDates.duration} days)`;
                                }
                                // Default/Fixed
                                if (travelDates.start) {
                                    return `${travelDates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${travelDates.end ? travelDates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...'}`;
                                }
                                return 'Date of Travel';
                            })()}
                        </button>
                        <button
                            id="next-step-btn"
                            className={styles.nextBtn}
                            disabled={!selectedCountry || !countries.find(c => c.id === selectedCountry)?.available}
                            onClick={() => {
                                setStep(2);
                                setCountrySearch('');
                            }}
                        >
                            Next Step <ChevronRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                        </button>
                    </div>
                </div>
            </>
        );
    };

    const renderStep2 = () => {
        const filteredStates = availableStates.filter(s =>
            s.name.toLowerCase().includes(regionSearch.trim().toLowerCase())
        );

        const handleAISelectRegions = async () => {
            const btn = document.getElementById('ai-region-btn');
            if (btn) {
                btn.innerText = "Consulting Experts...";
                btn.disabled = true;
            }

            try {
                const aiSuggestions = await TripAI.recommendRegions(selectedCountry);
                // aiSuggestions = [{ name, reason }]

                const matchedIds = [];
                const reasonMap = {};

                aiSuggestions.forEach(sug => {
                    // Match name to availableStates
                    const match = availableStates.find(state => state.name.toLowerCase().includes(sug.name.toLowerCase()) || sug.name.toLowerCase().includes(state.name.toLowerCase()));
                    if (match) {
                        matchedIds.push(match.id);
                        reasonMap[match.id] = sug.reason;
                    }
                });

                if (matchedIds.length > 0) {
                    setSelectedStates(matchedIds);
                    setAiRegionReasons(reasonMap);
                } else {
                    // Fallback if AI names don't match our DB (rare but possible)
                    if (availableStates.length > 0) {
                        const shuffled = [...availableStates].sort(() => 0.5 - Math.random());
                        const selected = shuffled.slice(0, 2).map(s => s.id);
                        setSelectedStates(selected);
                        alert("AI couldn't find exact matches in our database, so we picked some popular favorites!");
                    }
                }

            } catch (e) {
                console.error("AI Region Select Failed", e);
            } finally {
                if (btn) {
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> Let AI Decide';
                    btn.disabled = false;
                }
            }
        };

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

                {/* AI / Random Selection for User */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button
                        id="ai-region-btn"
                        className={styles.secondaryBtn}
                        onClick={handleAISelectRegions}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        <Sparkles size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        Let AI Decide
                    </button>
                </div>

                {/* Numbered Selection Section for Regions */}
                {selectedStates.length > 0 && (
                    <div className={styles.selectionSection}>
                        <div className={styles.selectionHeader}>
                            <span>Your Selections ({selectedStates.length})</span>
                            <span style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => { setSelectedStates([]); setAiRegionReasons({}); }}>Clear All</span>
                        </div>
                        <div className={styles.selectionList}>
                            {selectedStates.map((id, idx) => {
                                const item = availableStates.find(s => s.id === id);
                                const reason = aiRegionReasons[id];
                                return item ? (
                                    <div key={id} className={styles.selectionChip} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className={styles.index}>{idx + 1}</span>
                                            {item.name}
                                        </div>
                                        {reason && (
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginLeft: '28px' }}>
                                                " {reason} "
                                            </div>
                                        )}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                <div className={styles.grid} style={{ marginTop: '1rem' }}>
                    {filteredStates.length > 0 ? (
                        filteredStates.map(state => (
                            <div
                                key={state.id}
                                className={`${styles.card} ${selectedStates.includes(state.id) ? styles.selected : ''}`}
                                onClick={() => handleStateToggle(state.id)}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img src={state.image} alt={state.name} className={styles.cardImage} />
                                    {selectedStates.includes(state.id) && <div className={styles.checkIcon}><Check size={20} /></div>}
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardTitle}>{state.name}</div>
                                    <div className={styles.cardDesc}>{state.desc}</div>
                                    {/* Inline reason display if we want it on card too */}
                                    {aiRegionReasons[state.id] && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>
                                            Recommended: {aiRegionReasons[state.id]}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <MapPin size={48} strokeWidth={1} />
                            <div className={styles.emptyTitle}>No Regions Found</div>
                            <p>We couldn't find any regions matching "{regionSearch}".</p>
                            <button onClick={() => setRegionSearch('')} className={styles.viewDetailsBtn} style={{ marginTop: '1rem' }}>
                                Clear Search
                            </button>
                        </div>
                    )}
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

        // 3. Filter Destinations based on Selected States & Search
        // Robust Filter: Map selected keys (which might be names "Assam") to IDs (251)
        const regionFiltered = destinations.filter(d =>
            selectedStates.some(key => {
                // If key matches state_id directly
                if (String(key) === String(d.state_id)) return true;
                // If key is a Name, look it up in 'regions' list
                const region = regions.find(r => r.name === key);
                return region && String(region.id) === String(d.state_id);
            })
        );

        const filtered = regionFiltered.filter(d =>
            d.name.toLowerCase().includes(destSearch.trim().toLowerCase()) ||
            d.desc.toLowerCase().includes(destSearch.trim().toLowerCase())
        );


        const trending = filtered.filter(d => d.rating >= 4.8);
        const others = filtered.filter(d => d.rating < 4.8);

        // Pagination Logic
        const displayedDestinations = destSearch ? filtered.slice(0, visibleCount) : filtered;
        const hasMore = destSearch ? filtered.length > visibleCount : false;

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

                    <button
                        className={styles.addBtn}
                        onClick={() => setIsAddModalOpen(true)}
                        title="Add a new destination"
                    >
                        <Plus size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* AI / Random Selection for Destinations */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                    <button
                        className={styles.secondaryBtn}
                        onClick={async () => {
                            // Smart AI Recommendation
                            const btn = document.activeElement;
                            const originalText = btn.innerText;
                            btn.innerText = "AI is thinking...";
                            btn.disabled = true;

                            try {
                                const recs = await TripAI.recommendDestinations(selectedCountry, selectedStates, tripContext);
                                if (recs && recs.recommendedIds && recs.recommendedIds.length > 0) {
                                    setSelectedDestinations(recs.recommendedIds);
                                } else {
                                    // Fallback if AI fails to match IDs
                                    // Fallback if AI fails to match IDs
                                    // alert("AI suggested these, but we couldn't match all in our DB: " + (recs.aiNames || []).join(", "));
                                    // Do fallback random sort
                                    if (filtered.length > 0) {
                                        const sorted = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
                                        setSelectedDestinations(sorted.slice(0, 4).map(d => d.id));
                                    }
                                }
                            } catch (e) {
                                // console.error("AI select failed", e);
                            } finally {
                                btn.innerText = originalText;
                                btn.disabled = false;
                            }
                        }}
                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                    >
                        <Sparkles size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        AI Recommend Best 4
                    </button>
                </div>




                {/* Persistent Loading Indicator */}
                {fetchingRegion && (
                    <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '16px',
                        padding: '1rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        animation: 'slideDown 0.3s ease-out'
                    }}>
                        <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className={styles.radarEffect} style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #3b82f6', opacity: 0.5 }}></div>
                            <Sparkles size={20} className={styles.pulse} color="#3b82f6" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '0.95rem' }}>Scanning Satellite Data in Progress...</div>
                            <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>Found {destinations.length} spots so far. Still searching...</div>
                        </div>
                    </div>
                )}

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
                        {displayedDestinations.length > 0 ? (
                            <>
                                {displayedDestinations.map(dest => (
                                    <DestinationCard
                                        key={dest.id}
                                        dest={dest}
                                        isSelected={selectedDestinations.includes(dest.id)}
                                        onToggle={handleDestinationToggle}
                                        onViewDetails={(d) => { setSelectedDetailDest(d); setDetailsModalOpen(true); }}
                                    />
                                ))}
                                {hasMore && (
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 24)}
                                            className={styles.viewDetailsBtn}
                                            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                                        >
                                            Show More Results
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyTitle}>No Matches</div>
                                <p>We couldn't find any destinations matching "{destSearch}".</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* LOCAL MATCHES */}
                        {filtered.length > 0 ? (
                            <>
                                {trending.length > 0 && (
                                    <>
                                        <div className={styles.sectionHeader}><Sparkles size={20} color="#fbbf24" /> Trending in Region</div>
                                        <div className={styles.grid}>
                                            {trending.map(dest => (
                                                <DestinationCard
                                                    key={dest.id}
                                                    dest={dest}
                                                    isSelected={selectedDestinations.includes(dest.id)}
                                                    onToggle={handleDestinationToggle}
                                                    onViewDetails={(d) => { setSelectedDetailDest(d); setDetailsModalOpen(true); }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                                {others.length > 0 && (
                                    <>
                                        <div className={styles.sectionHeader}><MapPin size={20} color="#64748b" /> More in Region</div>
                                        <div className={styles.grid}>
                                            {others.slice(0, visibleCount).map(dest => (
                                                <DestinationCard
                                                    key={dest.id}
                                                    dest={dest}
                                                    isSelected={selectedDestinations.includes(dest.id)}
                                                    onToggle={handleDestinationToggle}
                                                    onViewDetails={(d) => { setSelectedDetailDest(d); setDetailsModalOpen(true); }}
                                                />
                                            ))}
                                            {others.length > visibleCount && (
                                                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                                    <button
                                                        onClick={() => setVisibleCount(prev => prev + 24)}
                                                        className={styles.viewDetailsBtn}
                                                        style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                                                    >
                                                        Show More Results
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            /* GLOBAL FALLBACK or LOADING */
                            <div className={styles.emptyState}>
                                {fetchingRegion ? (
                                    /* Hidden or minimal loader if needed, but for now we remove it as per user request */
                                    null
                                ) : (
                                    <>
                                        <Sparkles size={48} strokeWidth={1} style={{ color: '#fbbf24' }} />
                                        <div className={styles.emptyTitle}>New Region Detected!</div>
                                        <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                            This region doesn't have curated spots yet. Be the first to add one, or explore our global favorites below.
                                        </p>
                                        <button
                                            className={styles.nextBtn}
                                            onClick={() => setIsAddModalOpen(true)}
                                            style={{ marginBottom: '3rem' }}
                                        >
                                            Add a Destination <ExternalLink size={16} />
                                        </button>

                                        <div className={styles.sectionHeader} style={{ justifyContent: 'center', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                            <MapPin size={20} color="#64748b" /> Global Favorites
                                        </div>
                                        <div className={styles.grid} style={{ width: '100%', marginTop: '1rem' }}>
                                            {/* Show random 6 destinations from global list */}
                                            {destinations.slice(0, 6).map(dest => (
                                                <DestinationCard
                                                    key={dest.id}
                                                    dest={dest}
                                                    isSelected={selectedDestinations.includes(dest.id)}
                                                    onToggle={handleDestinationToggle}
                                                    onViewDetails={(d) => { setSelectedDetailDest(d); setDetailsModalOpen(true); }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep(2)}>
                        <ChevronLeft size={18} /> Back
                    </button>
                    <div className={styles.actionButtonsGroup}>

                        <button
                            id="next-step-btn"
                            className={styles.nextBtn}
                            disabled={selectedDestinations.length === 0 || !travelDates.type}
                            onClick={generateItinerary}
                            style={{ flex: '1 1 auto', minWidth: '140px' }}
                        >
                            {loading ? 'Consulting AI Agent...' : 'Generate AI Plan'} <Sparkles size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                        </button>
                    </div>
                </div>

                <DateSelectionModal
                    isOpen={showDateModal}
                    onClose={() => setShowDateModal(false)}
                    onApply={handleDateApply}
                />



                <AIDestinationDetailsModal
                    isOpen={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    destination={selectedDetailDest}
                />

                <AddDestinationModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={(newDest) => {
                        setDestinations(prev => [newDest, ...prev]);
                        // Optionally select it automatically
                        setSelectedDestinations(prev => [...prev, newDest.id]);
                    }}
                    selectedRegionId={selectedStates[0] ?
                        // Map name to ID if needed
                        (regions.find(r => r.name === selectedStates[0])?.id || selectedStates[0])
                        : null
                    }
                />
            </>
        );
    };

    const renderStep4 = () => {
        return (
            <>
                <h2 className={styles.title}>Your Smart Itinerary</h2>
                <p className={styles.subtitle}>An optimized travel plan curated just for you.</p>

                <div className={styles.itineraryContainer} style={{ maxWidth: '1000px', padding: '0 1rem' }}>
                    {/* Replaced plain chat with Timeline UI */}
                    <ChatWidget />
                    {/* Logic to show timeline if we have structured data, else fallback or mix */}

                    {itinerary.length > 0 ? (
                        <>
                            {/* Integrating the new Timeline Component */}
                            {/* Make sure to import ItineraryTimeline at top of file */}
                            <div style={{ marginBottom: '2rem' }}>
                                <ItineraryTimeline itinerary={itinerary} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                                <button className={styles.secondaryBtn} onClick={() => window.print()}>
                                    Print Itinerary
                                </button>
                                <Link to="/booking" className={styles.nextBtn} style={{ textDecoration: 'none' }}>
                                    Proceed to Booking <ChevronRight size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyTitle}>Generating your plan...</div>
                            <p>This usually takes a few seconds.</p>
                        </div>
                    )}

                    <div className={styles.summaryCard}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Total Duration</span>
                            <span className={styles.summaryValue}>{itinerary[itinerary.length - 1]?.day || 0} Days</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Est. Budget</span>
                            <span className={styles.summaryValue}>
                                ₱{budget.toLocaleString()}
                                <div style={{ fontSize: '0.7em', fontWeight: 'normal', color: '#64748b' }}>
                                    ({tripContext.style} Style)
                                </div>
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

                    {/* Step 8: Booking Assistance */}
                    <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                        <h3 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Booking Assistance</h3>
                        <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>We found some options that match your <strong>{tripContext.style}</strong> style.</p>

                        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            {/* Accommodation Card */}
                            <div className={styles.card} style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem', background: '#eff6ff', width: 'fit-content', padding: '0.5rem', borderRadius: '8px' }}>
                                    <MapPin size={24} color="#3b82f6" />
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem' }}>Stays</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                    Found 12 {tripContext.style} hotels near your destinations.
                                </p>
                                <Link to="/booking" className={styles.viewDetailsBtn} style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                    View Hotels
                                </Link>
                            </div>

                            {/* Flights Card */}
                            <div className={styles.card} style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem', background: '#fefce8', width: 'fit-content', padding: '0.5rem', borderRadius: '8px' }}>
                                    <ExternalLink size={24} color="#ca8a04" />
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem' }}>Transport</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                    Flights and trains matching your {tripContext.days} day schedule.
                                </p>
                                <Link to="/booking" className={styles.viewDetailsBtn} style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                    Check Flights
                                </Link>
                            </div>

                            {/* Experiences Card */}
                            <div className={styles.card} style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem', background: '#f0fdf4', width: 'fit-content', padding: '0.5rem', borderRadius: '8px' }}>
                                    <Sparkles size={24} color="#16a34a" />
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem' }}>Experiences</h4>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                    Curated activities based on your interests.
                                </p>
                                <Link to="/booking" className={styles.viewDetailsBtn} style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                    Browse Activities
                                </Link>
                            </div>
                        </div>
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

                <BudgetSelectionModal
                    isOpen={budgetModalOpen}
                    onClose={() => setBudgetModalOpen(false)}
                    onApply={(prefs) => {
                        setTripContext(prev => ({ ...prev, ...prefs }));
                        setBudgetModalOpen(false);
                        // No auto-navigation, just save context
                    }}
                />

                <DateSelectionModal
                    isOpen={showDateModal}
                    onClose={() => setShowDateModal(false)}
                    onApply={handleDateApply}
                />

                {/* Floating Scroll Button */}
                {(step === 1 || step === 2 || step === 3) && (
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
