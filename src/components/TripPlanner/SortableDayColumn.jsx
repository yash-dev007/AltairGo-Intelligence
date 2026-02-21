import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableActivityItem from './SortableActivityItem';
import styles from './ItineraryTimeline.module.css'; // Assuming we'll link this

const SortableDayColumn = ({ day, dayIndex, activities, onTriggerSwap }) => {
    const { setNodeRef } = useDroppable({
        id: `day-${dayIndex}`,
        data: { dayIndex }
    });

    return (
        <div className={styles.timelineItem} ref={setNodeRef}>
            <div className={styles.dayIndicator}>
                <span className={styles.dayNumber}>Day {day}</span>
                <div className={styles.timelineLine}></div>
            </div>

            <div className={styles.contentCard} style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <div className={styles.cardHeader} style={{ background: 'transparent' }}>
                    <h3 className={styles.locationTitle}>Your Plan for Day {day}</h3>
                </div>

                <div className={styles.activitiesList} style={{ padding: '0.5rem' }}>
                    <SortableContext
                        items={activities.map((act, idx) => `${dayIndex}-${idx}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        {activities.map((activity, idx) => (
                            <div key={`${dayIndex}-${idx}`} className={styles.activityRow} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
                                <SortableActivityItem
                                    id={`${dayIndex}-${idx}`}
                                    activity={activity}
                                    dayIndex={dayIndex}
                                    onTriggerSwap={onTriggerSwap}
                                />
                            </div>
                        ))}
                    </SortableContext>

                    {activities.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Drag activities here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SortableDayColumn;
