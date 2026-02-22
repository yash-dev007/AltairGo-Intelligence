import React, { useState } from 'react';
import { Plus, ChevronDown, CheckCircle2 } from 'lucide-react';
import styles from './AddDestinationModal.module.css';
import { API_BASE_URL } from '../config';

const TAGS = ['Nature', 'Beach', 'Mountain', 'City', 'Hidden Gem', 'History', 'Adventure'];

const CustomDropdown = ({ options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={styles.dropdownContainer}>
            <div className={styles.dropdownHeader} onClick={() => setIsOpen(!isOpen)}>
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
                            onClick={() => { onSelect(opt); setIsOpen(false); }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const EMPTY_FORM = { name: '', desc: '', cost: '', tag: 'Hidden Gem' };

const AddDestinationModal = ({ isOpen, onClose, onSubmit, selectedRegionId }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setFormData(EMPTY_FORM);
        setSubmitted(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formData.name,
            state_id: selectedRegionId || null,
            desc: formData.desc,
            tag: formData.tag,
            cost: parseInt(formData.cost) || 3000,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/destination-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newDest = await response.json();
                newDest.isNewUserAdded = true;
                setSubmitted(true);
                setFormData(EMPTY_FORM);
                if (onSubmit) onSubmit(newDest); // Add card to parent list
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to add destination. Please try again.');
            }
        } catch (error) {
            console.error('Error adding destination:', error);
            alert('Network error. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <CheckCircle2 size={56} color="#34d399" style={{ marginBottom: '1rem' }} />
                        <h2 className={styles.title} style={{ marginBottom: '0.5rem' }}>Request Submitted!</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Your suggestion has been sent for admin review. It will appear once approved!
                        </p>
                        <button className={styles.submitBtn} onClick={handleClose} style={{ display: 'block', margin: '0 auto' }}>Done</button>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Add a Destination</h2>
                            <p className={styles.subtitle}>Know a hidden gem? Add it directly to the map.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Destination Name *</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Secret Lagoon, Dooars Forest"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description *</label>
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
                                <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : <><Plus size={16} /> Add Destination</>}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddDestinationModal;
