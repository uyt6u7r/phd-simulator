export const RANDOM_EVENT_POOL = [
    {
        id: 'RENT_HIKE',
        title: 'Landlord Greed',
        description: 'Your landlord claims "market adjustments" require a rent increase.',
        type: 'bad',
        weight: 2,
        effect: { physiological: { stress: 15 } },
        specialEffect: { rentChange: 50 }
    },
    {
        id: 'LAPTOP_BREAK',
        title: 'Blue Screen of Death',
        description: 'Your laptop died. Emergency repairs required.',
        type: 'bad',
        weight: 3,
        effect: { funds: -300, physiological: { stress: 20, sanity: -5 } }
    },
    {
        id: 'TAX_REFUND',
        title: 'Tax Refund',
        description: 'The government actually gave you money back.',
        type: 'good',
        weight: 2,
        effect: { funds: 400, physiological: { stress: -5 } }
    },
    {
        id: 'CITATION_ALERT',
        title: 'New Citation',
        description: 'Someone cited your work!',
        type: 'good',
        weight: 3,
        effect: { career: { reputation: 10 }, physiological: { stress: -5 } }
    }
];