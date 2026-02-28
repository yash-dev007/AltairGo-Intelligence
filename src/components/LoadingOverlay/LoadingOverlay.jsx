import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Compass, Map, Plane, Sun, Palmtree, Sparkles } from 'lucide-react';
import styles from './LoadingOverlay.module.css';

const LOADING_PHASES = [
    { text: "Analyzing your travel preferences...", icon: Compass },
    { text: "Extracting the best destinations...", icon: Map },
    { text: "Curating a personalized itinerary...", icon: Sparkles },
    { text: "Adding local hidden gems...", icon: Palmtree },
    { text: "Calculating optimal routes & budget...", icon: Sun },
    { text: "Finalizing your dream trip...", icon: Plane }
];

const LoadingOverlay = ({ isVisible, currentPhaseIndex = 0 }) => {
    const [activePhase, setActivePhase] = useState(0);

    // Automatically cycle through phases if a specific phase index isn't driven by parent
    useEffect(() => {
        if (!isVisible) return;

        // If parent is not managing phases, we auto-cycle
        const interval = setInterval(() => {
            setActivePhase((prev) => (prev + 1) % LOADING_PHASES.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [isVisible]);

    const displayPhase = (currentPhaseIndex > 0 && currentPhaseIndex < LOADING_PHASES.length)
        ? currentPhaseIndex
        : activePhase;

    const CurrentIcon = LOADING_PHASES[displayPhase].icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.container}>

                        {/* Animated Plane & Route */}
                        <div className={styles.animationWrapper}>
                            <motion.div
                                className={styles.planeWrapper}
                                animate={{
                                    y: [0, -15, 0],
                                    x: [-10, 10, -10],
                                    rotate: [-5, 5, -5]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Plane size={64} className={styles.planeIcon} strokeWidth={1.5} />
                            </motion.div>

                            <svg className={styles.flightPath} viewBox="0 0 200 100">
                                <motion.path
                                    d="M 20 80 Q 100 20 180 80"
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="3"
                                    strokeDasharray="8 8"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            </svg>
                        </div>

                        <motion.h2
                            className={styles.title}
                            key={displayPhase}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Building Your Dream Trip
                        </motion.h2>

                        <motion.div
                            className={styles.statusBox}
                            key={`status-${displayPhase}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <CurrentIcon className={styles.statusIcon} size={24} />
                            <p className={styles.statusText}>{LOADING_PHASES[displayPhase].text}</p>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;
