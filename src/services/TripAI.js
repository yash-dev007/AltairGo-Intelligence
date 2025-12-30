// This service communicates with the Python Backend (Flask)
// Ensure the backend is running on http://localhost:5000

import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

export const TripAI = {
    // Generates a day-by-day itinerary based on selected destinations
    generateItinerary: async (selectedDestIds) => {
        try {
            const response = await fetch(`${API_BASE}/generate-itinerary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedDestIds })
            });
            if (!response.ok) throw new Error('Failed to generate itinerary');
            return await response.json();
        } catch (error) {
            console.error("AI Service Error:", error);
            // Fallback empty plan or error handling
            return [];
        }
    },

    // Calculates the estimated budget based on destination costs and duration
    calculateBudget: async (itinerary) => {
        try {
            const response = await fetch(`${API_BASE}/calculate-budget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itinerary })
            });
            if (!response.ok) throw new Error('Failed to calculate budget');
            const data = await response.json();
            return data.totalCost;
        } catch (error) {
            console.error("AI Service Error:", error);
            return 0;
        }
    },

    // Generates smart insights based on the composition of the trip
    getSmartInsight: async (itinerary) => {
        try {
            const response = await fetch(`${API_BASE}/smart-insight`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itinerary })
            });
            if (!response.ok) throw new Error('Failed to get insights');
            return await response.json();
        } catch (error) {
            console.error("AI Service Error:", error);
            return { type: 'info', text: "AI Insight unavailable (Check backend connection)." };
        }
    }
};
