export const JOURNALS = [
    {
        id: 'NATURE',
        name: 'Nature',
        description: 'The holy grail. Rejects 92% of papers.',
        impactFactor: 64.8,
        minimumQuality: 85,
        acceptQuality: 98,
        specificRequirements: { novelty: 90, attraction: 80 },
        reputationReward: 150,
        citationFactor: 5.0,
        costToSubmit: 0
    },
    {
        id: 'J_APPL_PHYS',
        name: 'J. Applied Physics',
        description: 'Solid workhorse journal.',
        impactFactor: 2.8,
        minimumQuality: 50,
        acceptQuality: 75,
        specificRequirements: { feasibility: 60 },
        reputationReward: 30,
        citationFactor: 1.0,
        costToSubmit: 0
    },
    {
        id: 'PREDATORY',
        name: 'Intl. J. of Astrology',
        description: 'Spam email journal. Accepts anything for a fee.',
        impactFactor: 0.1,
        minimumQuality: 0,
        acceptQuality: 5,
        specificRequirements: {},
        reputationReward: -10,
        citationFactor: 0.0,
        costToSubmit: 500
    }
];