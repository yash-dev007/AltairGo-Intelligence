// This service communicates with the Python Backend (Flask)
// Ensure the backend is running on http://localhost:5000

import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

export const TripAI = {
    // Generates a day-by-day itinerary based on selected destinations
    generateItinerary: async (selectedDestIds, preferences = {}) => {
        try {
            const response = await fetch(`${API_BASE}/generate-itinerary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedDestIds,
                    preferences: {
                        ...preferences,
                        interests: preferences.interests || [],
                        style: preferences.style || 'Balanced',
                        budget: preferences.budget || 50000
                    }
                })
            });
            if (!response.ok) throw new Error('Failed to generate itinerary');
            return await response.json();
        } catch (error) {
            console.error("AI Service Error:", error);
            throw error; // Let caller handle the error
        }
    },

    // Recommend destinations based on Country/Region choices + Budget Prefs
    recommendDestinations: async (countryName, regionNames, prefs = {}) => {
        try {
            const response = await fetch(`${API_BASE}/recommend-destinations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ countryName, regionNames, prefs })
            });
            if (!response.ok) throw new Error('Failed to recommend');
            const data = await response.json();
            return data.destinations || [];
        } catch (error) {
            console.error("AI Recommendation Error:", error);
            return [];
        }
    },

    // Recommend Regions (Step 2)
    recommendRegions: async (countryId) => {
        try {
            const response = await fetch(`${API_BASE}/recommend-regions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ countryId })
            });
            if (!response.ok) throw new Error('Failed to recommend regions');
            return await response.json();
        } catch (error) {
            console.error("AI Region Error:", error);
            // Return empty list or handle in UI
            return [];
        }
    },

    // Get Detailed AI Info for a Destination (Step 6)
    getDestinationDetails: async (destinationName) => {
        try {
            const response = await fetch(`${API_BASE}/destination-details-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destinationName })
            });
            if (!response.ok) throw new Error('Failed to get details');
            return await response.json();
        } catch (error) {
            console.error("AI Details Error:", error);
            return null;
        }
    },

    // Get DB Destination Details by ID
    getDestinationById: async (id) => {
        try {
            const response = await fetch(`${API_BASE}/destinations/${id}`);
            if (!response.ok) throw new Error('Failed to get DB details');
            return await response.json();
        } catch (error) {
            console.error("DB Details Error:", error);
            return null;
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
    },

    // Chat with AI Agent
    chat: async (message) => {
        try {
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!response.ok) throw new Error('Chat failed');
            const data = await response.json();
            return data.reply;  // Backend sends { reply: "..." }
        } catch (error) {
            console.error("AI Chat Error:", error);
            return "I'm having trouble connecting to the travel database right now. Please try again later.";
        }
    },

    saveTrip: async (tripData, token) => {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE}/api/save-trip`, {
                method: 'POST',
                headers,
                body: JSON.stringify(tripData)
            });
            if (!response.ok) throw new Error('Save failed');
            return await response.json();
        } catch (error) {
            console.error("Save Trip Error:", error);
            return { error: error.message };
        }
    }
};
