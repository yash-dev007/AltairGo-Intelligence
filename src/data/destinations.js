import elNidoImg from '../assets/destinations/el_nido_beach_1766575854708.png';
import baguioImg from '../assets/destinations/baguio_mountain_1766575886054.png';
import siargaoImg from '../assets/destinations/siargao_surf_1766575924456.png';
import viganImg from '../assets/destinations/vigan_heritage_1766575968336.png';

// Placeholder images for new destinations - using existing ones temporarily or generic placeholders if available. 
// Since I cannot browse external stock sites, I will re-use existing images with a note or valid placeholder services if allowed, 
// but best to reuse existing imports to ensure no broken images, or generate new ones later if requested.
// For now, I will reuse the imports cyclically for the new items to ensure visual stability.

export const destinationsData = [
    {
        id: 1,
        name: 'El Nido',
        desc: 'Beach paradise',
        description: 'El Nido is known for its stunning limestone cliffs, crystal-clear waters, and hidden lagoons. It is a gateway to the Bacuit Archipelago, a group of islands with pristine beaches and vibrant marine life.',
        rating: 4.8,
        reviews: '1.2k',
        location: 'Palawan',
        image: elNidoImg,
        price: '4,999',
        highlights: ['Big Lagoon', 'Small Lagoon', 'Secret Beach', 'Seven Commandos Beach'],
        itinerary: [
            'Day 1: Arrival and Town Exploration',
            'Day 2: Island Hopping Tour A (Big Lagoon, Secret Lagoon)',
            'Day 3: Island Hopping Tour C (Hidden Beach, Matinloc Shrine)',
            'Day 4: Relax at Nacpan Beach',
            'Day 5: Departure'
        ],
        bestTime: 'November to May'
    },
    {
        id: 2,
        name: 'Baguio City',
        desc: 'Mountain Getaway',
        description: 'The Summer Capital of the Philippines, Baguio offers a cool climate, pine-scented air, and a vibrant arts scene. It is a perfect escape from the tropical heat.',
        rating: 4.6,
        reviews: '950',
        location: 'Benguet',
        image: baguioImg,
        price: '3,200',
        highlights: ['Burnham Park', 'Camp John Hay', 'Mines View Park', 'BenCab Museum'],
        itinerary: [
            'Day 1: Arrival and Session Road walk',
            'Day 2: Burnham Park and Museum tour',
            'Day 3: Camp John Hay eco-trail',
            'Day 4: Strawberry Picking in La Trinidad',
            'Day 5: Departure'
        ],
        bestTime: 'December to February'
    },
    {
        id: 3,
        name: 'Siargao',
        desc: 'Surf & Chill',
        description: 'The Surfing Capital of the Philippines, Siargao is famous for its Cloud 9 surf break, coconut palm forests, and laid-back island vibe.',
        rating: 4.9,
        reviews: '2k',
        location: 'Surigao del Norte',
        image: siargaoImg,
        price: '5,500',
        highlights: ['Cloud 9 Boardwalk', 'Magpupungko Rock Pools', 'Sugba Lagoon', 'Coconut Trees View Deck'],
        itinerary: [
            'Day 1: Arrival and Sunset at Cloud 9',
            'Day 2: Surfing lessons and Magpupungko Rock Pools',
            'Day 3: Land Tour (Maasin River, Coconut View Deck)',
            'Day 4: Island Hopping (Naked, Daku, Guyam)',
            'Day 5: Departure'
        ],
        bestTime: 'July to November (for surfing)'
    },
    {
        id: 4,
        name: 'Vigan',
        desc: 'Heritage City',
        description: 'A UNESCO World Heritage site, Vigan is one of the few surviving Hispanic towns in the Philippines, famous for its cobblestone streets and Spanish colonial architecture.',
        rating: 4.7,
        reviews: '780',
        location: 'Ilocos Sur',
        image: viganImg,
        price: '4,250',
        highlights: ['Calle Crisologo', 'Syquia Mansion', 'Bantay Bell Tower', 'Dancing Fountain'],
        itinerary: [
            'Day 1: Arrival and Night Walk at Calle Crisologo',
            'Day 2: Vigan Heritage Tour (Museums, Pottery)',
            'Day 3: Bantay Bell Tower and Baluarte Zoo',
            'Day 4: Empanada tasting and Souvenir shopping',
            'Day 5: Departure'
        ],
        bestTime: 'November to April'
    },
    {
        id: 5,
        name: 'Boracay',
        desc: 'White Sand Beach',
        description: 'Famous for its powdery white sand and vibrant nightlife, Boracay is one of the world\'s top beach destinations, perfect for relaxation and water sports.',
        rating: 4.9,
        reviews: '5k',
        location: 'Aklan',
        image: elNidoImg,
        price: '6,000',
        highlights: ['White Beach', 'Puka Shell Beach', 'Willy\'s Rock', 'Ariel\'s Point'],
        itinerary: [
            'Day 1: Arrival and Sunset Sailing',
            'Day 2: Island Hopping and Snorkeling',
            'Day 3: Water Sports (Parasailing, Helmet Dive)',
            'Day 4: Relax at Puka Beach',
            'Day 5: Departure'
        ],
        bestTime: 'November to April'
    },
    {
        id: 6,
        name: 'Cebu City',
        desc: 'Queen City of the South',
        description: 'Cebu offers a mix of rich history, modern city life, and accessible natural wonders like Kawasan Falls and swimming with whale sharks in Oslob.',
        rating: 4.7,
        reviews: '1.5k',
        location: 'Cebu',
        image: siargaoImg,
        price: '3,800',
        highlights: ['Magellan\'s Cross', 'Temple of Leah', 'Sirao Garden', 'Kawasan Falls'],
        itinerary: [
            'Day 1: City Tour (Magellan\'s Cross, Fort San Pedro)',
            'Day 2: South Cebu Tour (Oslob Whale Sharks, Tumalog Falls)',
            'Day 3: Canyoneering at Kawasan Falls',
            'Day 4: Busay Mountain Tour (Temple of Leah, Sirao)',
            'Day 5: Departure'
        ],
        bestTime: 'January to April'
    },
    {
        id: 7,
        name: 'Bohol',
        desc: 'Chocolate Hills',
        description: 'Home to the iconic Chocolate Hills and the adorable Tarsier, Bohol is a nature lover\'s paradise with white sand beaches in Panglao.',
        rating: 4.8,
        reviews: '1.1k',
        location: 'Bohol',
        image: baguioImg,
        price: '4,500',
        highlights: ['Chocolate Hills', 'Tarsier Sanctuary', 'Loboc River Cruise', 'Alona Beach'],
        itinerary: [
            'Day 1: Arrival in Panglao',
            'Day 2: Countryside Tour (Chocolate Hills, Tarsiers)',
            'Day 3: Loboc River Cruise and Man-made Forest',
            'Day 4: Island Hopping (Balicasag, Virgin Island)',
            'Day 5: Departure'
        ],
        bestTime: 'November to April'
    },
    {
        id: 8,
        name: 'Coron',
        desc: 'Island Hopping',
        description: 'Known for its World War II wrecks, crystal-clear freshwater lakes, and stunning limestone karsts, Coron is a diver\'s and adventurer\'s dream.',
        rating: 4.9,
        reviews: '1.8k',
        location: 'Palawan',
        image: elNidoImg,
        price: '5,200',
        highlights: ['Kayangan Lake', 'Twin Lagoon', 'Maquinit Hot Spring', 'Skeleton Wreck'],
        itinerary: [
            'Day 1: Arrival and climb Mt. Tapyas',
            'Day 2: Coron Island Ultimate Tour (Kayangan, Twin Lagoon)',
            'Day 3: Reef and Wrecks Tour',
            'Day 4: Relax at Maquinit Hot Spring',
            'Day 5: Departure'
        ],
        bestTime: 'November to May'
    }
];
