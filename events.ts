
import { RandomEvent } from './types';

export const RANDOM_EVENT_POOL: RandomEvent[] = [
    // --- FINANCIAL (BAD) ---
    {
        id: 'RENT_HIKE',
        title: 'Landlord Greed',
        description: 'Your landlord claims "market adjustments" require a rent increase.',
        type: 'bad',
        weight: 2,
        effect: {
            physiological: { stress: 15 }
        },
        specialEffect: { rentChange: 50 }
    },
    {
        id: 'LAPTOP_BREAK',
        title: 'Blue Screen of Death',
        description: 'Your laptop died. You had to pay for emergency repairs.',
        type: 'bad',
        weight: 3,
        effect: {
            funds: -300,
            physiological: { stress: 20, sanity: -5 }
        }
    },
    {
        id: 'CONFERENCE_FEE',
        title: 'Hidden Fees',
        description: 'You forgot to pay your society membership dues.',
        type: 'bad',
        weight: 4,
        effect: {
            funds: -150
        }
    },

    // --- FINANCIAL (GOOD) ---
    {
        id: 'TAX_REFUND',
        title: 'Tax Refund',
        description: 'The government actually gave you money back. A miracle.',
        type: 'good',
        weight: 2,
        effect: {
            funds: 400,
            physiological: { stress: -5 }
        }
    },
    {
        id: 'FREE_FOOD',
        title: 'Leftover Catering',
        description: 'You found a stack of untouched sandwiches in the hallway.',
        type: 'good',
        weight: 5,
        effect: {
            funds: 20, // Saved lunch money
            energy: 10,
            physiological: { health: 2 }
        }
    },

    // --- HEALTH/LIFE (BAD) ---
    {
        id: 'FLU',
        title: 'The Flu',
        description: 'You caught the seasonal flu circulating the lab.',
        type: 'bad',
        weight: 3,
        effect: {
            energy: -40,
            physiological: { health: -15, stress: 5 }
        }
    },
    {
        id: 'INSOMNIA',
        title: 'Insomnia',
        description: 'You stared at the ceiling until 5 AM thinking about your thesis.',
        type: 'bad',
        weight: 4,
        effect: {
            energy: -30,
            physiological: { sanity: -5 }
        }
    },

    // --- HEALTH/LIFE (GOOD) ---
    {
        id: 'GOOD_SLEEP',
        title: 'Perfect Sleep',
        description: 'You woke up feeling strangely refreshed and powerful.',
        type: 'good',
        weight: 3,
        effect: {
            energy: 30,
            physiological: { sanity: 5, health: 2 }
        }
    },
    {
        id: 'PARENTS_VISIT_GIFT',
        title: 'Care Package',
        description: 'Your parents sent a box of snacks and vitamins.',
        type: 'good',
        weight: 3,
        effect: {
            physiological: { sanity: 10, health: 5, stress: -5 }
        }
    },

    // --- ACADEMIC (BAD) ---
    {
        id: 'LAB_ACCIDENT',
        title: 'Equipment Failure',
        description: 'You broke a very expensive beaker. The technician is glaring at you.',
        type: 'bad',
        weight: 3,
        effect: {
            physiological: { stress: 15 },
            career: { supervisorRel: -5 }
        }
    },
    {
        id: 'scooped',
        title: 'Almost Scooped',
        description: 'A similar paper was published. You need to pivot slightly.',
        type: 'bad',
        weight: 2,
        effect: {
            physiological: { stress: 25, sanity: -10 },
            talents: { resilience: 2 }
        }
    },
    
    // --- ACADEMIC (GOOD) ---
    {
        id: 'CITATION_ALERT',
        title: 'New Citation',
        description: 'Someone cited your work! (It wasn\'t just you citing yourself).',
        type: 'good',
        weight: 3,
        effect: {
            career: { reputation: 10 },
            physiological: { stress: -5 }
        }
    },
    {
        id: 'EUREKA_SHOWER',
        title: 'Shower Thought',
        description: 'You solved a minor bug while shampooing.',
        type: 'good',
        weight: 4,
        effect: {
            talents: { logic: 2 },
            skills: { analysis: 2 }
        }
    },
    {
        id: 'CONFERENCE_ACCEPT',
        title: 'Poster Accepted',
        description: 'Your abstract was accepted for a poster presentation.',
        type: 'good',
        weight: 2,
        effect: {
            career: { reputation: 15 },
            skills: { presentation: 5 }
        }
    },
    
    // --- SUPERVISOR ---
    {
        id: 'SUPERVISOR_GHOST',
        title: 'Supervisor Ghosted',
        description: 'Your supervisor cancelled the meeting. You are free!',
        type: 'good',
        weight: 4,
        effect: {
            physiological: { stress: -10 },
            energy: 10
        }
    },
    {
        id: 'SUPERVISOR_DEMAND',
        title: 'Sudden Deadline',
        description: 'Your supervisor needs a slide deck by tomorrow morning.',
        type: 'bad',
        weight: 3,
        effect: {
            energy: -20,
            physiological: { stress: 15 },
            career: { supervisorRel: 5 } // At least they are happy you did it
        }
    }
];
