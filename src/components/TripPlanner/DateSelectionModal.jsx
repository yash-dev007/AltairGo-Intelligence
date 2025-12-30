
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Minus, Plus } from 'lucide-react';
import styles from './DateSelectionModal.module.css';

const DateSelectionModal = ({ isOpen, onClose, onApply }) => {
    // Start from current date
    const [viewDate, setViewDate] = useState(new Date());
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // New State for Flexible/Anytime
    const [activeTab, setActiveTab] = useState('fixed');
    const [duration, setDuration] = useState(7);
    const [selectedMonthDate, setSelectedMonthDate] = useState(null); // First day of selected month

    // Reset view when reopened
    useEffect(() => {
        if (isOpen) {
            // Defer to avoid synchronous state update warning
            setTimeout(() => setViewDate(new Date()), 0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Helper to get formatted date string "Jan 13 - Jan 18"
    const getDateString = () => {
        if (activeTab === 'fixed') {
            if (!startDate) return '';
            const options = { month: 'short', day: 'numeric' };
            const startStr = startDate.toLocaleDateString('en-US', options);
            if (!endDate) return startStr;
            const endStr = endDate.toLocaleDateString('en-US', options);
            const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
            return `${startStr} - ${endStr} | ${daysDiff} Days`;
        } else if (activeTab === 'flexible') {
            if (!selectedMonthDate) return 'Select a month';
            return `${selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} | ${duration} Days`;
        } else {
            return `Anytime | ${duration} Days`;
        }
    };

    const handleApply = () => {
        onApply({
            type: activeTab,
            start: startDate,
            end: endDate,
            duration: duration,
            month: selectedMonthDate
        });
        onClose();
    };

    // Calendar logic helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (delta) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    const handleDateClick = (date) => {
        if (!startDate || (startDate && endDate)) {
            // Start new selection
            setStartDate(date);
            setEndDate(null);
        } else {
            // Complete selection or reset if clicking before start
            if (date < startDate) {
                setStartDate(date);
            } else {
                setEndDate(date);
            }
        }
    };



    // Optimized: Use timestamps for faster comparison
    const startDateTs = startDate ? startDate.getTime() : null;
    const endDateTs = endDate ? endDate.getTime() : null;

    const renderMonth = (offset = 0) => {
        const currentYear = viewDate.getFullYear();
        const currentMonth = viewDate.getMonth() + offset;

        // Handle year rollover for display
        const displayDate = new Date(currentYear, currentMonth, 1);
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month); // 0 = Sun, 1 = Mon...

        const days = [];
        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty - ${i} `} />);
        }

        // Days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTs = today.getTime();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateTs = date.getTime();

            const isSelected = dateTs === startDateTs || dateTs === endDateTs;
            const inRange = startDateTs && endDateTs && dateTs > startDateTs && dateTs < endDateTs;
            const isRangeStart = dateTs === startDateTs && endDateTs;
            const isRangeEnd = dateTs === endDateTs && startDateTs;
            const isDisabled = dateTs < todayTs;

            days.push(
                <button
                    key={day}
                    className={`
                        ${styles.dayBtn} 
                        ${isSelected ? styles.selected : ''} 
                        ${inRange ? styles.inRange : ''}
                        ${isRangeStart ? styles.rangeStart : ''}
                        ${isRangeEnd ? styles.rangeEnd : ''}
                        ${isDisabled ? styles.disabled : ''}
`}
                    disabled={isDisabled}
                    onClick={() => handleDateClick(date)}
                >
                    {day}
                </button>
            );
        }

        return (
            <div className={styles.monthSection}>
                <div className={styles.monthTitle}>
                    {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className={styles.weekdays}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className={styles.weekday}>{d}</div>
                    ))}
                </div>
                <div className={styles.daysGrid}>
                    {days}
                </div>
            </div>
        );
    };

    const renderDurationControl = () => (
        <div className={styles.durationSection}>
            <div className={styles.durationLabel}>How many days?</div>
            <div className={styles.durationControl}>
                <button
                    className={styles.durationBtn}
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                >
                    <Minus size={18} />
                </button>
                <div className={styles.durationValue}>{duration}</div>
                <button
                    className={styles.durationBtn}
                    onClick={() => setDuration(duration + 1)}
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );

    const renderFlexible = () => {
        // Generate next 12 months
        const months = [];
        const today = new Date();
        // Start from next month to be safe or current
        let current = new Date(today.getFullYear(), today.getMonth(), 1);

        for (let i = 0; i < 12; i++) {
            const mDate = new Date(current);
            const isSelected = selectedMonthDate &&
                mDate.getMonth() === selectedMonthDate.getMonth() &&
                mDate.getFullYear() === selectedMonthDate.getFullYear();

            months.push(
                <div
                    key={i}
                    className={`${styles.monthCard} ${isSelected ? styles.selected : ''} `}
                    onClick={() => setSelectedMonthDate(mDate)}
                >
                    <Calendar size={24} className={styles.monthIcon} />
                    <div className={styles.monthName}>{mDate.toLocaleDateString('en-US', { month: 'long' })}</div>
                    <div className={styles.yearLabel}>{mDate.getFullYear()}</div>
                </div>
            );
            current.setMonth(current.getMonth() + 1);
        }

        return (
            <div className={styles.flexibleContent}>
                <div className={styles.monthGrid}>
                    {months}
                </div>
                {renderDurationControl()}
            </div>
        );
    };

    const renderAnytime = () => {
        return (
            <div className={styles.anytimeContent}>
                {renderDurationControl()}
            </div>
        );
    };

    const isSelectionComplete = () => {
        if (activeTab === 'fixed') return startDate && endDate;
        if (activeTab === 'flexible') return selectedMonthDate;
        if (activeTab === 'anytime') return true;
        return false;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${activeTab === 'anytime' ? styles.modalCompact : styles.modalStandard}`}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>When do you want to travel?</h2>
                    <div className={styles.dateDisplay}>{getDateString()}</div>
                </div>

                <div className={styles.tabs}>
                    {['Fixed', 'Flexible', 'Anytime'].map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab.toLowerCase() ? styles.active : ''} `}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'fixed' && (
                    <div className={styles.calendarContainer}>
                        <button className={`${styles.navBtn} ${styles.prevBtn} `} onClick={() => changeMonth(-1)}>
                            <ChevronLeft size={20} />
                        </button>
                        {renderMonth(0)}
                        {renderMonth(1)}
                        <button className={`${styles.navBtn} ${styles.nextBtn} `} onClick={() => changeMonth(1)}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {activeTab === 'flexible' && renderFlexible()}
                {activeTab === 'anytime' && renderAnytime()}

                <div className={styles.footer}>
                    <button
                        className={styles.clearBtn}
                        onClick={() => {
                            setStartDate(null);
                            setEndDate(null);
                            setSelectedMonthDate(null);
                        }}
                    >
                        Clear
                    </button>
                    <button
                        className={styles.applyBtn}
                        onClick={handleApply}
                        disabled={!isSelectionComplete()}
                        style={{ opacity: isSelectionComplete() ? 1 : 0.5, cursor: isSelectionComplete() ? 'pointer' : 'not-allowed' }}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateSelectionModal;
