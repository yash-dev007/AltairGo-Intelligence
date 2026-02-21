import React, { useState, useEffect, useMemo } from 'react';
import styles from './ItineraryTimeline.module.css';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import SortableDayColumn from './SortableDayColumn';
import SortableActivityItem from './SortableActivityItem';
import ActivitySwapModal from './ActivitySwapModal';

const ItineraryTimeline = ({ itinerary, onItineraryChange }) => {
    // 1. Add unique IDs to itinerary items if they don't have them
    // This is crucial for DnD to track items accurately
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        // Flatten detailed_activities into sortable items if not already flat
        const flatItems = [];
        if (itinerary.length > 0 && itinerary[0].detailed_activities) {
            itinerary.forEach((dayItem, dayIdx) => {
                dayItem.detailed_activities.forEach((act, actIdx) => {
                    flatItems.push({
                        ...act,
                        day: dayItem.day,
                        location: dayItem.location,
                        destId: dayItem.destId || dayItem.id, // Preserve ID
                        image: act.image || dayItem.image, // Use activity image or day image
                        _id: act._id || `act-${dayItem.day}-${dayIdx}-${actIdx}-${Date.now()}`
                    });
                });
            });
            setItems(flatItems);
        } else {
            // Already flat or simple structure
            const enrichedItems = itinerary.map((item, idx) => ({
                ...item,
                _id: item._id || `item-${Date.now()}-${idx}`
            }));
            setItems(enrichedItems);
        }
    }, [itinerary]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts (prevents accidental clicks)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group items by day for rendering columns
    // We assume 'items' is the source of truth
    const days = useMemo(() => {
        const uniqueDays = [...new Set(items.map(i => i.day))].sort((a, b) => a - b);
        return uniqueDays;
    }, [items]);

    const getItemsForDay = (day) => items.filter(i => i.day === day);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeItem = items.find(i => i._id === active.id);
        const overItem = items.find(i => i._id === over.id);

        if (!activeItem) return;

        // Clone items to mutate
        let newItems = [...items];

        // Scenario 1: Dropped over a specific item
        if (overItem) {
            const activeIndex = newItems.findIndex(i => i._id === active.id);
            const overIndex = newItems.findIndex(i => i._id === over.id);

            // If moving to a different day, update the day field
            if (activeItem.day !== overItem.day) {
                activeItem.day = overItem.day;
                newItems[activeIndex] = { ...activeItem, day: overItem.day };
            }

            // Move the item in the array to the new position
            newItems = arrayMove(newItems, activeIndex, overIndex);
        }
        // Scenario 2: Dropped over a Day Column (container) but empty area
        else if (over.id.startsWith('day-column-')) {
            const targetDay = parseInt(over.id.replace('day-column-', ''));
            const activeIndex = newItems.findIndex(i => i._id === active.id);

            // Just move it to that day, append to end implies generic day assignment
            if (activeItem.day !== targetDay) {
                newItems[activeIndex] = { ...activeItem, day: targetDay };
                // We don't need arrayMove effectively if we just change day, 
                // it will render in that group. 
                // However, to be precise, let's move it to end of that day's list or just update day.
            }
        }

        setItems(newItems);
        if (onItineraryChange) {
            onItineraryChange(newItems);
        }
    };

    const [swapModalOpen, setSwapModalOpen] = useState(false);
    const [activityToSwap, setActivityToSwap] = useState(null);

    const handleSwapTrigger = (activity) => {
        setActivityToSwap(activity);
        setSwapModalOpen(true);
    };

    const handleSwapConfirm = (newActivity) => {
        if (!activityToSwap) return;

        // Create new item structure keeping context but changing details
        const updatedItem = {
            ...activityToSwap,
            activity: newActivity.name,
            description: newActivity.description || newActivity.desc,
            cost: newActivity.entry_cost || 0,
            type: newActivity.type,
            image: newActivity.image
            // Keep day and time same
        };

        // Find and replace in items
        const newItems = items.map(i => i._id === activityToSwap._id ? updatedItem : i);

        setItems(newItems);
        if (onItineraryChange) onItineraryChange(newItems);

        setSwapModalOpen(false);
        setActivityToSwap(null);
    };

    const activeItemData = activeId ? items.find(i => i._id === activeId) : null;

    return (
        <div className={styles.timelineContainer}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {days.map(day => (
                        <SortableDayColumn
                            key={day}
                            day={day}
                            dayIndex={day} // Passing day number as index for simplicity
                            activities={getItemsForDay(day)}
                            id={`day-column-${day}`}
                            onTriggerSwap={handleSwapTrigger}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeItemData ? (
                        <div style={{ transform: 'none' }}> {/* Reset transform for overlay */}
                            <div className={styles.activityItem} style={{ background: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #3b82f6', cursor: 'grabbing' }}>
                                <strong>{activeItemData.activity || activeItemData.activities}</strong>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ActivitySwapModal
                isOpen={swapModalOpen}
                onClose={() => setSwapModalOpen(false)}
                originalActivity={activityToSwap}
                onSwap={handleSwapConfirm}
            />
        </div>
    );
};

export default ItineraryTimeline;
