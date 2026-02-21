import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import styles from './ItineraryTimeline.module.css';

const SortableActivityItem = ({ id, activity, dayIndex, onTriggerSwap }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id, data: { dayIndex, activity } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Prevent scrolling while dragging on touch devices
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={styles.activityItem}
            {...attributes}
        >
            <div style={{ padding: '0.5rem', display: 'flex', gap: '1rem' }}>
                {/* Drag Handle */}
                <div
                    {...listeners}
                    style={{ cursor: 'grab', color: '#94a3b8', display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}
                >
                    <GripVertical size={16} />
                </div>

                {/* Optional Activity Image */}
                {activity.image && (
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={activity.image} alt={activity.activity} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div style={{ flex: 1 }}>
                    {/* Header: Time & Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{activity.activity}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{activity.time} • {activity.duration || '2 hours'}</div>
                        </div>
                        {activity.cost > 0 && (
                            <div style={{ fontSize: '0.9rem', color: '#059669', fontWeight: '600' }}>₹{activity.cost}</div>
                        )}
                    </div>

                    {/* Description / Why */}
                    <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                        {activity.description}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>
                            View Photos
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onTriggerSwap && onTriggerSwap(activity);
                            }}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            🔄 Swap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortableActivityItem;
