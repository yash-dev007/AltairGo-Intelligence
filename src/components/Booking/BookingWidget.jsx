import React, { useState } from 'react';
import { Plane, Hotel, Briefcase, Calendar, MapPin, Users, Train, Bus, Home, Ship } from 'lucide-react';
import styles from './BookingWidget.module.css';

const BookingWidget = () => {
    const [activeTab, setActiveTab] = useState('flights');
    const [flightType, setFlightType] = useState('oneWay');

    const renderFormInfo = () => {
        switch (activeTab) {
            case 'flights':
                return (
                    <>
                        <div className={styles.subOptions}>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="flightType"
                                    checked={flightType === 'oneWay'}
                                    onChange={() => setFlightType('oneWay')}
                                /> One Way
                            </label>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="flightType"
                                    checked={flightType === 'roundTrip'}
                                    onChange={() => setFlightType('roundTrip')}
                                /> Round Trip
                            </label>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="flightType"
                                    checked={flightType === 'multiCity'}
                                    onChange={() => setFlightType('multiCity')}
                                /> Multi City
                            </label>
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>From</label>
                                <input type="text" className={styles.input} placeholder="Delhi (DEL)" defaultValue="Delhi" />
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>DEL, Delhi Airport India</span>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>To</label>
                                <input type="text" className={styles.input} placeholder="Mumbai (BOM)" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Departure</label>
                                <input type="date" className={styles.input} />
                            </div>
                            {flightType === 'roundTrip' && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Return</label>
                                    <input type="date" className={styles.input} />
                                </div>
                            )}
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Travellers & Class</label>
                                <input type="text" className={styles.input} placeholder="1 Traveller" defaultValue="1 Traveller" readOnly />
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Economy/Premium Economy</span>
                            </div>
                        </div>
                    </>
                );
            case 'hotels':
                return (
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>City/Hotel/Area</label>
                            <input type="text" className={styles.input} placeholder="e.g. Goa" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Check-in</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Check-out</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Guests</label>
                            <input type="text" className={styles.input} placeholder="2 Adults, 1 Room" />
                        </div>
                    </div>
                );
            case 'packages':
                return (
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Destination</label>
                            <input type="text" className={styles.input} placeholder="Where to?" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Departure Date</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Duration</label>
                            <select className={styles.input} style={{ background: 'transparent' }}>
                                <option>3-5 Days</option>
                                <option>5-7 Days</option>
                                <option>7+ Days</option>
                            </select>
                        </div>
                    </div>
                );
            case 'homestays':
                return (
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>City/Location</label>
                            <input type="text" className={styles.input} placeholder="e.g. Manali" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Check-in</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Check-out</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Guests</label>
                            <input type="text" className={styles.input} placeholder="2 Guests" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Type</label>
                            <select className={styles.input} style={{ background: 'transparent' }}>
                                <option>Entire Villa</option>
                                <option>Homestay</option>
                                <option>Cottage</option>
                            </select>
                        </div>
                    </div>
                );
            case 'cruise':
                return (
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Destination/River</label>
                            <input type="text" className={styles.input} placeholder="e.g. Singapore, Amazon" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Departure Month</label>
                            <input type="month" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Duration</label>
                            <select className={styles.input} style={{ background: 'transparent' }}>
                                <option>3-5 Nights</option>
                                <option>5-7 Nights</option>
                                <option>7+ Nights</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Travelers</label>
                            <input type="text" className={styles.input} placeholder="2 Travelers" />
                        </div>
                    </div>
                );
            case 'trains':
                return (
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>From</label>
                            <input type="text" className={styles.input} placeholder="New Delhi (NDLS)" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>To</label>
                            <input type="text" className={styles.input} placeholder="Agra (AGC)" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Travel Date</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Class</label>
                            <select className={styles.input} style={{ background: 'transparent' }}>
                                <option>All Classes</option>
                                <option>Sleeper (SL)</option>
                                <option>AC 3 Tier (3A)</option>
                                <option>AC 2 Tier (2A)</option>
                                <option>AC 1st Class (1A)</option>
                            </select>
                        </div>
                    </div>
                );
            case 'buses':
                return (
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>From</label>
                            <input type="text" className={styles.input} placeholder="e.g. Bangalore" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>To</label>
                            <input type="text" className={styles.input} placeholder="e.g. Goa" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Travel Date</label>
                            <input type="date" className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Seats</label>
                            <input type="text" className={styles.input} placeholder="1 Seat" defaultValue="1 Seat" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.widgetContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'flights' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('flights')}
                >
                    <Plane className={styles.tabIcon} />
                    <span className={styles.tabLabel}>Flights</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'hotels' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('hotels')}
                >
                    <Hotel className={styles.tabIcon} />
                    <span className={styles.tabLabel}>Hotels</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'packages' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('packages')}
                >
                    <Briefcase className={styles.tabIcon} />
                    <span className={styles.tabLabel}>Packages</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'homestays' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('homestays')}
                >
                    <Home className={styles.tabIcon} />
                    <span className={styles.tabLabel} style={{ whiteSpace: 'normal', textAlign: 'center', lineHeight: '1.2' }}>Homestays <br /> & Villas</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'cruise' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('cruise')}
                >
                    <Ship className={styles.tabIcon} />
                    <span className={styles.tabLabel}>Cruise</span>
                </button>
                {/* Visual filler tabs for the "full text" feel */}
                <button
                    className={`${styles.tab} ${activeTab === 'trains' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('trains')}
                >
                    <Train className={styles.tabIcon} />
                    <span className={styles.tabLabel}>Trains</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'buses' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('buses')}
                >
                    <Bus className={styles.tabIcon} />
                    <span className={styles.tabLabel}>Buses</span>
                </button>
            </div>

            {renderFormInfo()}

            <div className={styles.searchBtnContainer}>
                <button className={styles.searchBtn}>
                    Search
                </button>
            </div>
        </div>
    );
};

export default BookingWidget;
