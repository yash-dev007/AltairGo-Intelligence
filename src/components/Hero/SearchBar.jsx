import React from 'react';
import styles from './SearchBar.module.css';
import { MapPin, Calendar, Search } from 'lucide-react';

const SearchBar = () => {
    return (
        <div className={styles.searchBar}>
            <div className={styles.inputGroup}>
                <MapPin size={20} className={styles.icon} />
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Destination</label>
                    <input
                        type="text"
                        placeholder="Try: Meghalaya, Himachal, Ladakh…"
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.inputGroup}>
                <Calendar size={20} className={styles.icon} />
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Dates</label>
                    <input
                        type="text"
                        placeholder="Add dates (optional)"
                        className={styles.input}
                    />
                </div>
            </div>

            <button className={styles.submitButton}>
                <span className={styles.btnText}>Plan My Trip</span>
                <Search size={20} className={styles.btnIcon} />
            </button>
        </div>
    );
};

export default SearchBar;
