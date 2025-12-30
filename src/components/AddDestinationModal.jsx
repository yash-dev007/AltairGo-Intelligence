import React, { useState } from 'react';
import { MapPin, X, Plus, ChevronDown } from 'lucide-react';
import styles from './AddDestinationModal.module.css';

const TAGS = ['Nature', 'Beach', 'Mountain', 'City', 'Hidden Gem', 'History', 'Adventure'];

const CustomDropdown = ({ options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.dropdownContainer}>
            <div
                className={styles.dropdownHeader}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected}
                <ChevronDown
                    size={16}
                    className={styles.dropdownArrow}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                />
            </div>
            {isOpen && (
                <div className={styles.dropdownList}>
                    {options.map(opt => (
                        <div
                            key={opt}
                            className={`${styles.dropdownItem} ${selected === opt ? styles.selectedItem : ''}`}
                            onClick={() => {
                                onSelect(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AddDestinationModal = ({ isOpen, onClose, onSubmit, selectedRegionId }) => {
    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        cost: '',
        tag: 'Hidden Gem'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Prepare payload
        const payload = {
            name: formData.name,
            state_id: selectedRegionId, // Must be passed from parent
            desc: formData.desc,
            tag: formData.tag,
            cost: parseInt(formData.cost) || 3000,
            price: `₹${formData.cost || 3000}`
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/destinations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newDest = await response.json();
                onSubmit(newDest); // Pass back to parent to update UI
                onClose();
            } else {
                alert('Failed to add destination. Please try again.');
            }
        } catch (error) {
            console.error('Error adding dest:', error);
            alert('Error adding destination.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add New Destination</h2>
                    <p className={styles.subtitle}>Help us map the world, one gem at a time.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Destination Name</label>
                        <input
                            className={styles.input}
                            placeholder="e.g. Secret Lagoon"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="What makes this place special?"
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Vibe Tag</label>
                        <CustomDropdown
                            options={TAGS}
                            selected={formData.tag}
                            onSelect={tag => setFormData({ ...formData, tag })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Estimated Daily Cost (₹)</label>
                        <input
                            type="number"
                            className={styles.input}
                            placeholder="3000"
                            value={formData.cost}
                            onChange={e => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : <><Plus size={18} /> Add to Map</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDestinationModal;
