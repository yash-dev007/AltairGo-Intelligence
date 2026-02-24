import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ChevronLeft, ChevronRight, Check, MapPin, Star, Sparkles, ExternalLink, Calendar, Users, Search, ArrowUp, ArrowDown, X, Plus, Share2 } from 'lucide-react';
import { TripAI } from '../../services/TripAI';
import { API_BASE_URL } from '../../config';
import AddDestinationModal from '../../components/AddDestinationModal';
import DateSelectionModal from '../../components/TripPlanner/DateSelectionModal';
import DestinationCard from '../../components/TripPlanner/DestinationCard';
import ModernItineraryView from '../../components/TripPlanner/ModernItineraryView';
import BudgetSelectionModal from '../../components/TripPlanner/BudgetSelectionModal';
import ChatWidget from '../../components/ChatWidget/ChatWidget';
import TripOptions from '../../components/TripPlanner/TripOptions';
import AIDestinationDetailsModal from '../../components/TripPlanner/AIDestinationDetailsModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import styles from './TripPlanner.module.css';



const TripPlannerPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const step = parseInt(searchParams.get('step') || '1');
    const countryParam = searchParams.get('country') || null;
    const regionsParam = searchParams.get('regions') || null;

    const setStep = (newStep) => {
        const params = { step: newStep.toString() };
        if (selectedCountry) params.country = selectedCountry;
        if (selectedStates.length > 0) params.regions = selectedStates.join(',');
        setSearchParams(params);
    };

    const { token } = useAuth(); // Get token for saving trips
    const navigate = useNavigate();
    // const [step, setStep] = useState(1); // REPLACED by URL params
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [preferencesSet, setPreferencesSet] = useState(false); // Track if user has set trip preferences

    // 3-phase loading state
    const LOADING_PHASES = [
        '✨ AI is analyzing your preferences...',
        '🗺️ Optimizing routes and scheduling...',
        '💰 Calculating costs and insights...'
    ];
    const [loadingPhase, setLoadingPhase] = useState(0);
    const loadingIntervalRef = React.useRef(null);

    // Feedback / Report Issue modal state
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackType, setFeedbackType] = useState('Wrong prices');
    const [feedbackDesc, setFeedbackDesc] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);

    // Validation warnings from backend
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [budgetAdjusted, setBudgetAdjusted] = useState(false);
    const [warningDismissed, setWarningDismissed] = useState(false);


    // Trip Context
    const [tripContext, setTripContext] = useState({
        budget: 50000,
        days: 5,
        style: 'Standard'
    });
    const [countries, setCountries] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(countryParam);
    const [selectedStates, setSelectedStates] = useState(regionsParam ? regionsParam.split(',') : []);
    const [availableStates, setAvailableStates] = useState([]);
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [itinerary, setItinerary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [budget, setBudget] = useState(0);
    const [insight, setInsight] = useState(null);
    const [visibleCount, setVisibleCount] = useState(24);
    const [tripOptions, setTripOptions] = useState([]);
    const [aiRegionReasons, setAiRegionReasons] = useState({}); // { regionId: 'Reason...' }

    // Search States
    const [countrySearch, setCountrySearch] = useState('');
    const [regionSearch, setRegionSearch] = useState('');
    const [destSearch, setDestSearch] = useState('');
    const [startLocation, setStartLocation] = useState('Mumbai'); // Default
    const [isCustomLocation, setIsCustomLocation] = useState(false);
    const [generatingAiSpots, setGeneratingAiSpots] = useState(false);

    // AI Decision Flags
    const [isAiRegionDecide, setIsAiRegionDecide] = useState(false);
    const [isAiDestDecide, setIsAiDestDecide] = useState(false);

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
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedDetailDest, setSelectedDetailDest] = useState(null);
    const [travelDates, setTravelDates] = useState({ start: null, end: null });

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesRes, destsRes, regionsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/countries`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } }),
                    fetch(`${API_BASE_URL}/destinations`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } }),
                    fetch(`${API_BASE_URL}/regions`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
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
        if ((step === 3 || step === 5)) {
            if (selectedStates.length > 0 || isAiRegionDecide) {
                checkAndFetchData();
            }
        }
    }, [step, selectedStates, isAiRegionDecide]); // eslint-disable-line react-hooks/exhaustive-deps

    const checkAndFetchData = async () => {
        let targets = [];

        if (selectedStates.length > 0) {
            targets = selectedStates;
        } else if (isAiRegionDecide && availableStates.length > 0) {
            // Pick top 3 available states to populate general data
            targets = availableStates.slice(0, 3).map(s => s.id);
        }

        if (targets.length === 0) return;

        console.log("Fetching live data for:", targets);
        setFetchingRegion(true);

        try {
            const countryObj = countries.find(c => c.id === selectedCountry);
            const countryName = countryObj?.name || 'India';

            // Collect selected state names
            const stateNames = targets.map(stateId => {
                const allRegions = [...(availableStates || []), ...(regions || [])];
                const regionObj = allRegions.find(r => r.id === stateId || r.name === stateId || r.id === Number(stateId));
                return regionObj?.name || stateId;
            });

            // Automatically prompt Gemini for recommendations based on these regions
            console.log(`Auto-generating AI spots for regions: ${stateNames.join(', ')}...`);
            const aiDestinations = await TripAI.recommendDestinations(countryName, stateNames, tripContext);

            if (aiDestinations && aiDestinations.length > 0) {
                setDestinations(prev => {
                    const existingIds = new Set(prev.map(d => d.name));
                    const newItems = aiDestinations.filter(d => !existingIds.has(d.name));
                    return [...prev, ...newItems];
                });
            }
        } catch (err) {
            console.error("Auto AI Gen failed for region:", err);
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
                id: region.name,        // Used for selection state (string key)
                numericId: region.id,   // Used for /populate API call (DB integer id)
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
            // Only clear selections if user explicitly changed country (not on initial mount from URL)
            if (!countryParam || selectedCountry !== countryParam) {
                setSelectedStates([]);
                setSelectedDestinations([]);
            }
            // Keep URL in sync
            setSearchParams(prev => {
                const params = Object.fromEntries(prev.entries());
                params.country = selectedCountry;
                return params;
            });
        }
    }, [selectedCountry, regions, destinations]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch budget and insights when entering Step 5
    useEffect(() => {
        if (step === 5 && itinerary.length > 0) {
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
        setLoadingPhase(0);
        setValidationWarnings([]);
        setBudgetAdjusted(false);
        setWarningDismissed(false);

        // Cycle loading phase messages every 2.5 seconds
        let phase = 0;
        loadingIntervalRef.current = setInterval(() => {
            phase = (phase + 1) % LOADING_PHASES.length;
            setLoadingPhase(phase);
        }, 2500);

        // Prepare Preferences Context with all details
        const countryObj = countries.find(c => c.id === selectedCountry);
        const userPreferences = {
            country: countryObj ? countryObj.name : 'Unknown',
            duration: travelDates.duration || tripContext.days || 5,
            budget: tripContext.budget,
            style: tripContext.style,
            startCity: startLocation,
            // Travel date details
            dateType: travelDates.type || 'anytime',
            travelStartDate: travelDates.start ? travelDates.start.toISOString() : null,
            travelEndDate: travelDates.end ? travelDates.end.toISOString() : null,
            travelMonth: travelDates.month ? travelDates.month.toLocaleString('default', { month: 'long', year: 'numeric' }) : null,
            // Interests from selected regions
            interests: selectedStates.length > 0 ? selectedStates : []
        };

        // If no destinations selected, we rely on the backend "Surprise Me" mode (empty list)
        // But if user manually selected, we send those.

        try {
            const data = await TripAI.generateItinerary(selectedDestinations, userPreferences);

            // Capture validation warnings from backend
            if (data.validation_warnings && data.validation_warnings.length > 0) {
                setValidationWarnings(data.validation_warnings);
            }
            if (data.budget_adjusted) {
                setBudgetAdjusted(true);
            }

            // NEW: Single Itinerary Object (Direct Mode)
            if (data.itinerary && Array.isArray(data.itinerary)) {
                if (data.itinerary.length === 0) {
                    alert("The AI generated an empty itinerary. Please modify your preferences or destination choices and try again.");
                    setLoading(false);
                    clearInterval(loadingIntervalRef.current);
                    return;
                }
                setItinerary(data.itinerary);
                setTripContext(prev => ({
                    ...prev,
                    title: data.trip_title || data.title,
                    estimatedCost: data.total_cost,
                    ai_perfect_reasons: data.ai_perfect_reasons || []
                }));
                setStep(5);
            }
            // OLD: Options Array (legacy)
            else if (data.options && data.options.length > 0) {
                setTripOptions(data.options);
                setStep(4);
            } else if (Array.isArray(data)) {
                if (data.length === 0) {
                    alert("The AI generated an empty itinerary. Please modify your preferences or destination choices and try again.");
                    setLoading(false);
                    clearInterval(loadingIntervalRef.current);
                    return;
                }
                setItinerary(data);
                setStep(5);
            } else if (data.error) {
                console.warn('AI Service returned error:', data.error);
                alert(`AI Generation Issue: ${data.error}\n\nPlease try again later or select destinations manually.`);
                setLoading(false);
                clearInterval(loadingIntervalRef.current);
                return;
            } else {
                console.warn('Unexpected itinerary format', data);
                alert('AI could not generate a valid itinerary for these preferences. Please try again with different settings.');
                setLoading(false);
                clearInterval(loadingIntervalRef.current);
                return;
            }

            clearInterval(loadingIntervalRef.current);
            setLoading(false);
        } catch (error) {
            console.error('Failed to generate itinerary', error);
            clearInterval(loadingIntervalRef.current);
            setLoading(false);
            if (error.message?.includes('No destinations found') || error.message?.includes('404')) {
                alert('No destinations found for your selection. Try selecting different regions or destinations manually.');
            } else {
                alert('Failed to generate itinerary. Please check your connection and try again.');
            }
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    issue_type: feedbackType,
                    description: feedbackDesc
                })
            });
            setFeedbackSent(true);
            setTimeout(() => {
                setShowFeedbackModal(false);
                setFeedbackSent(false);
                setFeedbackDesc('');
            }, 2000);
        } catch (e) {
            console.error('Feedback failed', e);
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
                            disabled={!selectedCountry || !countries.find(c => c.id === selectedCountry)?.available || !preferencesSet || !travelDates.type}
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

                {/* AI Decide Checkbox */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '50px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                        <input
                            type="checkbox"
                            checked={isAiRegionDecide}
                            onChange={(e) => {
                                setIsAiRegionDecide(e.target.checked);
                                if (e.target.checked) {
                                    setSelectedStates([]);
                                    setAiRegionReasons({});
                                }
                            }}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <Sparkles size={16} fill={isAiRegionDecide ? "#fbbf24" : "none"} color={isAiRegionDecide ? "#fbbf24" : "#94a3b8"} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: isAiRegionDecide ? '#0f172a' : '#64748b' }}>
                            Let AI Decide Regions
                        </span>
                    </label>
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
                    <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                        <ChevronLeft size={18} /> Back
                    </button>
                    <button
                        id="next-step-btn"
                        className={styles.nextBtn}
                        disabled={selectedStates.length === 0 && !isAiRegionDecide}
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
        const regionFiltered = destinations.filter(d => {
            // Only show AI generated or newly added spots (skip static DB ones)
            if (!d.isAiGenerated && !d.isNewUserAdded) return false;

            // If AI decides regions, allow any destination from available states in this country
            if (isAiRegionDecide) {
                return availableStates.some(state =>
                    String(state.id) === String(d.state_id) ||
                    state.name === d.location
                );
            }

            // Otherwise match against selected states
            return selectedStates.some(key => {
                // If key matches state_id directly
                if (String(key) === String(d.state_id)) return true;
                // If key is a Name, look it up in 'regions' list
                const region = regions.find(r => r.name === key);
                return region && String(region.id) === String(d.state_id);
            });
        });

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
                        onClick={() => {
                            if (!token) {
                                setShowLoginPrompt(true);
                            } else {
                                setIsAddModalOpen(true);
                            }
                        }}
                        title={token ? "Suggest a destination" : "Login to suggest a destination"}
                    >
                        <Plus size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* AI Decide Checkbox for Destinations */}
                {/* AI Generate Spots Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                    <button
                        onClick={async () => {
                            if (generatingAiSpots) return;
                            setGeneratingAiSpots(true);
                            try {
                                const countryObj = countries.find(c => c.id === selectedCountry);
                                const stateNames = selectedStates.map(id => availableStates.find(s => s.id === id)?.name || id);
                                const aiDestinations = await TripAI.recommendDestinations(countryObj?.name || 'India', stateNames, tripContext);

                                if (aiDestinations && aiDestinations.length > 0) {
                                    // Add to main destinations list so they show up
                                    setDestinations(prev => {
                                        const existingIds = new Set(prev.map(d => d.name));
                                        const newItems = aiDestinations.filter(d => !existingIds.has(d.name));
                                        return [...prev, ...newItems];
                                    });
                                    // Select them
                                    setSelectedDestinations(aiDestinations.map(d => d.id));
                                } else {
                                    alert("AI couldn't find spots right now. Please select manually.");
                                }
                            } catch (e) {
                                console.error("AI spots error", e);
                                alert("Failed to fetch AI spots.");
                            } finally {
                                setGeneratingAiSpots(false);
                            }
                        }}
                        disabled={generatingAiSpots}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: generatingAiSpots ? 'wait' : 'pointer',
                            padding: '0.75rem 1.25rem',
                            background: '#eff6ff',
                            borderRadius: '50px',
                            border: '2px solid #3b82f6',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
                        }}
                    >
                        <Sparkles size={18} fill="#3b82f6" color="#3b82f6" className={generatingAiSpots ? styles.pulse : ''} />
                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e40af' }}>
                            {generatingAiSpots ? "AI is gathering data..." : "Let AI Generate Spots"}
                        </span>
                    </button>
                </div>





                {/* Persistent Loading Indicator */}
                {
                    fetchingRegion && (
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
                    )
                }

                {/* Numbered Selection Section for Destinations */}
                {
                    selectedDestinations.length > 0 && (
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
                    )
                }

                {
                    destSearch ? (
                        <div className={styles.grid}>
                            {displayedDestinations.length > 0 ? (
                                <>
                                    {displayedDestinations.map(dest => (
                                        <DestinationCard
                                            key={dest.id}
                                            dest={dest}
                                            isSelected={selectedDestinations.includes(dest.id)}
                                            onToggle={handleDestinationToggle}
                                            onViewDetails={(d) => navigate(`/destination/${d.id}`)}
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
                                            <div className={styles.emptyTitle}>AI is analyzing your preferences...</div>
                                            <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                                If you don't see results soon, click the "Let AI Generate Spots" button above.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )
                }

                <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                        <ChevronLeft size={18} /> Back
                    </button>
                    <div className={styles.actionButtonsGroup}>

                        <button
                            id="next-step-btn"
                            className={styles.nextBtn}
                            disabled={selectedDestinations.length === 0}
                            onClick={generateItinerary}
                            style={{ flex: '1 1 auto', minWidth: '140px' }}
                        >
                            {loading ? LOADING_PHASES[loadingPhase] : 'Generate AI Plan'} <Sparkles size={18} style={{ display: 'inline', marginLeft: '5px' }} />
                        </button>
                    </div>
                </div>

                <DateSelectionModal
                    isOpen={showDateModal}
                    onClose={() => setShowDateModal(false)}
                    onApply={handleDateApply}
                />





                <AddDestinationModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={(newDest) => {
                        setDestinations(prev => [newDest, ...prev]);
                        setSelectedDestinations(prev => [...prev, newDest.id]);
                    }}
                    selectedRegionId={selectedStates[0] ?
                        (regions.find(r => r.name === selectedStates[0])?.id || selectedStates[0])
                        : null
                    }
                />
            </>
        );
    };

    const renderStep4 = () => {
        return (
            <TripOptions
                options={tripOptions}
                onSelectOption={(opt) => {
                    setItinerary(opt.itinerary);
                    setStep(5);
                }}
                onCustomize={(opt) => {
                    setItinerary(opt.itinerary);
                    setStep(5);
                }}
            />
        );
    };

    const renderStep5 = () => {
        return (
            <>
                {/* Page Header */}
                <h2 className={styles.title}>Your Smart Itinerary</h2>
                <p className={styles.subtitle}>An AI-optimized travel plan curated just for you</p>

                {/* Validation Warning Banner */}
                {(validationWarnings.length > 0 || budgetAdjusted) && !warningDismissed && (
                    <div style={{
                        background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                        border: '1.5px solid #f59e0b',
                        borderRadius: '16px',
                        padding: '1rem 1.25rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)'
                    }}>
                        <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                            {budgetAdjusted && (
                                <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '0.25rem' }}>
                                    This itinerary was adjusted to fit your budget.
                                </div>
                            )}
                            {validationWarnings.map((w, i) => (
                                <div key={i} style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.5 }}>{w}</div>
                            ))}
                        </div>
                        <button
                            onClick={() => setWarningDismissed(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: '700', fontSize: '1rem', lineHeight: 1 }}
                            aria-label="Dismiss warning"
                        >✕</button>
                    </div>
                )}

                {/* Feedback / Report Issue Modal */}
                {showFeedbackModal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem'
                    }}>
                        <div style={{
                            background: 'white', borderRadius: '24px', padding: '2rem',
                            maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                        }}>
                            {feedbackSent ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div style={{ fontSize: '3rem' }}>🙏</div>
                                    <div style={{ fontWeight: '700', fontSize: '1.2rem', margin: '1rem 0 0.5rem' }}>Thank you!</div>
                                    <div style={{ color: '#64748b' }}>Your feedback helps us improve the AI.</div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Report an Issue</h3>
                                        <button onClick={() => setShowFeedbackModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>Issue Type</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            {['Wrong prices', 'Impossible schedule', 'Generic names', 'Other'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setFeedbackType(type)}
                                                    style={{
                                                        padding: '0.6rem 1rem', borderRadius: '12px', border: '1.5px solid',
                                                        borderColor: feedbackType === type ? 'var(--primary)' : '#e2e8f0',
                                                        background: feedbackType === type ? 'var(--primary)' : 'white',
                                                        color: feedbackType === type ? 'white' : '#374151',
                                                        fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'
                                                    }}
                                                >{type}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>Description (optional)</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Tell us what was wrong..."
                                            value={feedbackDesc}
                                            onChange={e => setFeedbackDesc(e.target.value)}
                                            style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '0.75rem', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmitFeedback}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '50px', border: 'none',
                                            background: 'var(--primary)', color: 'white', fontWeight: '700',
                                            fontSize: '1rem', cursor: 'pointer'
                                        }}
                                    >Send Feedback</button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Modern AI Itinerary View */}
                {itinerary.length > 0 && <ChatWidget />}
                {itinerary.length > 0 ? (
                    <ModernItineraryView
                        itinerary={itinerary}
                        tripContext={tripContext}
                        insight={insight}
                    />
                ) : (
                    <div style={{ display: 'none' }}></div>
                )}

                {/* Booking Assistance Section */}
                <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                    <h3 className={styles.sectionHeader}>
                        <Sparkles size={24} />
                        Booking Assistance
                    </h3>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
                        Complete your trip with these matching options for your <strong>{tripContext.style}</strong> style
                    </p>

                    <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        {/* Stays Card */}
                        <div className={styles.card} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', background: '#eff6ff', width: 'fit-content', padding: '0.75rem', borderRadius: '12px' }}>
                                <MapPin size={24} color="#3b82f6" />
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Stays</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                12+ {tripContext.style} hotels near your destinations
                            </p>
                            <Link to="/booking" className={styles.viewDetailsBtn} style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                View Hotels
                            </Link>
                        </div>

                        {/* Transport Card */}
                        <div className={styles.card} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', background: '#fefce8', width: 'fit-content', padding: '0.75rem', borderRadius: '12px' }}>
                                <ExternalLink size={24} color="#ca8a04" />
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Transport</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                Flights & trains for your {tripContext.days || itinerary.length} day trip
                            </p>
                            <Link to="/booking" className={styles.viewDetailsBtn} style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                Check Flights
                            </Link>
                        </div>

                        {/* Experiences Card */}
                        <div className={styles.card} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', background: '#f0fdf4', width: 'fit-content', padding: '0.75rem', borderRadius: '12px' }}>
                                <Sparkles size={24} color="#16a34a" />
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Experiences</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                Curated activities based on your interests
                            </p>
                            <Link to="/booking" className={styles.viewDetailsBtn} style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                Browse Activities
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Booking anchor */}
                <div id="booking-section"></div>

                <div className={styles.actions}>
                    <button className={styles.backBtn} onClick={() => setStep(3)}>
                        <ChevronLeft size={18} /> Modify
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Save & Share Button */}
                        <button
                            className={styles.nextBtn}
                            style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0' }}
                            onClick={async () => {
                                // Save Trip Logic with all preferences
                                const tripPayload = {
                                    title: `Trip to ${countries.find(c => c.id === selectedCountry)?.name || 'Unknown'}`,
                                    startCity: startLocation,
                                    country: countries.find(c => c.id === selectedCountry)?.name || 'Unknown',
                                    duration: travelDates.duration || tripContext.days,
                                    budget: tripContext.budget,
                                    travelers: 1,
                                    style: tripContext.style,
                                    dateType: travelDates.type || 'anytime',
                                    travelStartDate: travelDates.start ? travelDates.start.toISOString() : null,
                                    travelEndDate: travelDates.end ? travelDates.end.toISOString() : null,
                                    travelMonth: travelDates.month ? travelDates.month.toLocaleString('default', { month: 'long', year: 'numeric' }) : null,
                                    itinerary: itinerary,
                                    totalCost: budget || 35000
                                };
                                const res = await TripAI.saveTrip(tripPayload, token); // Pass token
                                if (res.tripId) {
                                    alert(`Trip Saved! Share this link: ${window.location.origin}/trip/${res.tripId}`);
                                } else {
                                    alert("Failed to save trip. Please try again.");
                                }
                            }}
                        >
                            <Share2 size={18} style={{ display: 'inline', marginRight: '5px' }} /> Save & Share
                        </button>
                        <button
                            className={styles.nextBtn}
                            onClick={() => {
                                const bookingSec = document.getElementById('booking-section');
                                if (bookingSec) bookingSec.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Book This Trip
                        </button>
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
                    <div className={`${styles.stepDot} ${step >= 4 ? styles.active : ''} ${step > 4 ? styles.completed : ''}`}>4</div>
                    <div className={`${styles.stepLine} ${step > 4 ? styles.filled : ''}`} />
                    <div className={`${styles.stepDot} ${step >= 5 ? styles.active : ''}`}>5</div>
                </div>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}

                <BudgetSelectionModal
                    isOpen={budgetModalOpen}
                    onClose={() => setBudgetModalOpen(false)}
                    onApply={(prefs) => {
                        setTripContext(prev => ({ ...prev, ...prefs }));
                        setPreferencesSet(true);
                        setBudgetModalOpen(false);
                        // No auto-navigation, just save context
                    }}
                />

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

                {/* Login Required Prompt */}
                {showLoginPrompt && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, backdropFilter: 'blur(4px)'
                    }} onClick={() => setShowLoginPrompt(false)}>
                        <div style={{
                            background: '#fff', borderRadius: '20px', padding: '2.5rem 2rem',
                            maxWidth: '380px', width: '90%', textAlign: 'center',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔒</div>
                            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.3rem' }}>Login Required</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
                                You need to be logged in to suggest a destination.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setShowLoginPrompt(false)}
                                    style={{
                                        padding: '0.65rem 1.4rem', borderRadius: '50px',
                                        border: '1px solid #e2e8f0', background: '#f8fafc',
                                        color: '#475569', fontWeight: '500', cursor: 'pointer', fontSize: '0.95rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => navigate('/login?redirect=/trip-planner')}
                                    style={{
                                        padding: '0.65rem 1.4rem', borderRadius: '50px',
                                        border: 'none', background: 'var(--primary, #3b82f6)',
                                        color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem'
                                    }}
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
