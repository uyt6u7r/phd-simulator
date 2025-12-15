
import { Journal } from './types';

export const JOURNALS: Journal[] = [
    // --- TOP TIER (The Dream) ---
    {
        id: 'NATURE',
        name: 'Nature',
        description: 'The holy grail. Rejects 92% of papers. Reviewer #3 is a Nobel laureate.',
        impactFactor: 64.8,
        minimumQuality: 85,
        acceptQuality: 98,
        specificRequirements: {
            novelty: 90, // Must be groundbreaking
            attraction: 80
        },
        reputationReward: 150,
        citationFactor: 5.0, // Massive weekly citations
        costToSubmit: 0
    },
    {
        id: 'SCIENCE',
        name: 'Science',
        description: 'If it\'s not on the cover, did it even happen?',
        impactFactor: 63.7,
        minimumQuality: 85,
        acceptQuality: 98,
        specificRequirements: {
            novelty: 90,
            attraction: 80
        },
        reputationReward: 150,
        citationFactor: 5.0,
        costToSubmit: 0
    },

    // --- HIGH TIER (Respectable) ---
    {
        id: 'PRL',
        name: 'Phys. Rev. Letters',
        description: 'Prestigious, dense, and full of equations.',
        impactFactor: 8.8,
        minimumQuality: 70,
        acceptQuality: 90,
        specificRequirements: {
            feasibility: 70,
            novelty: 70
        },
        reputationReward: 80,
        citationFactor: 2.5,
        costToSubmit: 0
    },
    {
        id: 'JACS',
        name: 'J. Am. Chem. Soc.',
        description: 'Top chemistry journal. They love pretty molecules.',
        impactFactor: 14.4,
        minimumQuality: 70,
        acceptQuality: 90,
        specificRequirements: {
            resources: 60, // Likes expensive experiments
            attraction: 60
        },
        reputationReward: 80,
        citationFactor: 2.8,
        costToSubmit: 0
    },

    // --- MID TIER (The Bread & Butter) ---
    {
        id: 'J_APPL_PHYS',
        name: 'J. Applied Physics',
        description: 'Solid workhorse journal. Reliable, if unexciting.',
        impactFactor: 2.8,
        minimumQuality: 50,
        acceptQuality: 75,
        specificRequirements: {
            feasibility: 60 // Must definitely work
        },
        reputationReward: 30,
        citationFactor: 1.0,
        costToSubmit: 0
    },
    {
        id: 'PHYS_B',
        name: 'Physica B',
        description: 'Where decent condensed matter papers go to rest.',
        impactFactor: 2.1,
        minimumQuality: 40,
        acceptQuality: 65,
        specificRequirements: {
            // No strict requirements, just quality
        },
        reputationReward: 20,
        citationFactor: 0.8,
        costToSubmit: 0
    },

    // --- NICHE / SPECIFIC ---
    {
        id: 'J_NOVEL_MAT',
        name: 'J. Novel Materials',
        description: 'Obsessed with new things, even if they are useless.',
        impactFactor: 4.5,
        minimumQuality: 55,
        acceptQuality: 80,
        specificRequirements: {
            novelty: 80 // Must be new
        },
        reputationReward: 40,
        citationFactor: 1.5,
        costToSubmit: 0
    },
    {
        id: 'THEORY_ONLY',
        name: 'J. Pure Speculation',
        description: 'For papers with 0 resources but high logic.',
        impactFactor: 3.2,
        minimumQuality: 60,
        acceptQuality: 85,
        specificRequirements: {
            // Resources check is < in code, but here we likely mean low reqs. 
            // If the code checks (project < requirements), setting this to 20 means "Must be cheap".
            resources: 20, 
        },
        reputationReward: 35,
        citationFactor: 1.2,
        costToSubmit: 0
    },

    // --- LOW TIER / SAFETY ---
    {
        id: 'CONF_PROC',
        name: 'Proceedings of INT-CONF',
        description: 'Conference proceedings. Basically a guaranteed accept if you register.',
        impactFactor: 0.5,
        minimumQuality: 20,
        acceptQuality: 40,
        specificRequirements: {},
        reputationReward: 10,
        citationFactor: 0.2,
        costToSubmit: 0
    },
    {
        id: 'OPEN_ACCESS_MEGA',
        name: 'Sci-Repository Plus',
        description: 'Pay to play. If it is technically English, it prints.',
        impactFactor: 1.2,
        minimumQuality: 10,
        acceptQuality: 20,
        specificRequirements: {},
        reputationReward: 5,
        citationFactor: 0.5,
        costToSubmit: 1500 // Costs funds!
    },
    
    // --- PREDATORY (Trap) ---
    {
        id: 'PREDATORY',
        name: 'Intl. J. of Advanced Science & Astrology',
        description: 'Spam email journal. Accepts anything for a fee.',
        impactFactor: 0.1,
        minimumQuality: 0,
        acceptQuality: 5,
        specificRequirements: {},
        reputationReward: -10, // Penalty!
        citationFactor: 0.0,
        costToSubmit: 500
    }
];