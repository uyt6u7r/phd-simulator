// --- ENUMS ---
export const GamePhase = {
    SETUP: 'SETUP',
    PLAYING: 'PLAYING',
    GAMEOVER_WIN: 'GAMEOVER_WIN',
    GAMEOVER_BURNOUT: 'GAMEOVER_BURNOUT',
    GAMEOVER_BROKE: 'GAMEOVER_BROKE',
    GAMEOVER_EXPELLED: 'GAMEOVER_EXPELLED',
    GAMEOVER_RELATIONSHIP: 'GAMEOVER_RELATIONSHIP',
    GAMEOVER_INSANITY: 'GAMEOVER_INSANITY',
    GAMEOVER_HOSPITALIZED: 'GAMEOVER_HOSPITALIZED'
};
  
export const ResearchField = {
    PHYSICS: "Physics, Chemistry & Materials (Multidisciplinary)",
};

// --- DATA ---
export const INITIAL_STATS = {
    energy: 100,
    funds: 3000,
    physiological: { health: 100, stress: 10, sanity: 100 },
    talents: { creativity: 30, focus: 30, logic: 30, resilience: 30 },
    skills: { timeManagement: 20, reading: 20, writing: 20, experiment: 20, analysis: 20, presentation: 20 },
    career: { supervisorRel: 25, reputation: 0, meetingExpectation: 20, meetingPreparation: 0 }
};
  
export const MAX_STATS = {
    energy: 100,
    funds: 999999,
    physiological: { health: 100, stress: 100, sanity: 100 },
    talents: { creativity: 100, focus: 100, logic: 100, resilience: 100 },
    skills: { timeManagement: 100, reading: 100, writing: 100, experiment: 100, analysis: 100, presentation: 100 },
    career: { supervisorRel: 100, reputation: 999999, meetingExpectation: 100, meetingPreparation: 100 }
};

export const WEEKLY_RENT = 500;
export const WEEKLY_LAB_COST = 2000;
export const WIN_CONDITION_REPUTATION = 500;
export const WIN_CONDITION_PAPERS = 3;

export const COST = {
    RESEARCH: { energy: 15, funds: 0 },
    WRITE_PAPER: { energy: 20, funds: 0 },
    CONFERENCE: { energy: 10, funds: 800 },
    WORK_TASK: { energy: 15 },
    DEVELOP_IDEA: { energy: 20, physiological: { stress: 10 } }
};

export const CONFIRMATION_TASK = {
    id: 'CONFIRMATION',
    title: 'Confirmation of Candidature',
    description: 'Pass your confirmation review before Week 52 or be expelled.',
    progress: 0,
    totalEffort: 300,
    deadline: 52
};

export const BACKGROUND_POOL = [
    {
        id: 'RICH_KID',
        name: 'Preston Sterling III',
        education: 'BA Art History, Ivy League',
        description: 'Never washed a dish. Treating the PhD as a "gap decade".',
        imageColor: 'bg-emerald-600',
        initialModifiers: {
            funds: 8500, energy: -15,
            physiological: { stress: -12, sanity: 5 },
            skills: { timeManagement: -8, experiment: -14, presentation: 12, writing: -5 },
            talents: { resilience: -12, creativity: 8 }
        },
        weeklyModifier: { description: "Allowance from Dad (+$500).", effect: { funds: 500 } },
        exclusiveActions: [{ id: 'RETAIL_THERAPY', label: 'Retail Therapy', description: 'Buy happiness.', category: 'LIFE', cost: { funds: 800, energy: 5 }, effect: { physiological: { stress: -50, sanity: 20 } }, logMessage: "Bought a limited edition watch." }]
    },
    {
        id: 'GRINDER',
        name: 'Sarah Smith',
        education: 'BS, State University',
        description: 'Runs on caffeine and spite. Will outlast the cockroaches.',
        imageColor: 'bg-slate-700',
        initialModifiers: {
            funds: -2200, energy: 25,
            talents: { resilience: 35, focus: 5 },
            skills: { experiment: 12, analysis: 2, writing: 2 },
            physiological: { health: -10, stress: 15 }
        },
        weeklyModifier: { description: "Powered through. Energy +10, Health -2.", effect: { energy: 10, physiological: { health: -2 } } },
    },
    {
        id: 'GENIUS',
        name: 'Aarav Patel',
        education: 'PhD (Math) at 16',
        description: 'Brilliant, but socially anxious.',
        imageColor: 'bg-fuchsia-600',
        initialModifiers: {
            funds: -1500,
            talents: { logic: 42, creativity: 28, resilience: -15 },
            skills: { presentation: -18, writing: -8, analysis: 22 },
            physiological: { sanity: -15, stress: 15 }
        },
        weeklyModifier: { description: "Gifted Burnout. Stress +3, Logic +1.", effect: { physiological: { stress: 3 }, talents: { logic: 1 } } },
        exclusiveActions: [{ id: 'EUREKA', label: 'Brain Blast', description: 'Go into a trance.', category: 'ACADEMICS', cost: { energy: 40, physiological: { sanity: -10 } }, effect: { talents: { logic: 10, creativity: 10 }, physiological: { stress: 10 } }, logMessage: "Stared at the wall for 6 hours. Solution found." }]
    }
];

export const SUPERVISOR_POOL = [
    {
        id: 'PUSH',
        name: 'Prof. Richard Push',
        title: 'Distinguished Professor',
        institution: 'Institute of High Energy Stress',
        imageColor: 'bg-red-600',
        reputation: 95,
        initialFunding: 500000,
        description: 'Demands perfection. You will be famous, if you survive.',
        initialModifiers: { career: { reputation: 100, supervisorRel: 5 }, physiological: { stress: 20 } },
        weeklyModifier: { description: "Late night email. Stress +5, Rep +2.", effect: { physiological: { stress: 5 }, career: { reputation: 2 } } },
        exclusiveActions: [{ id: 'CRUNCH_TIME', label: 'Crunch Time', description: 'Work until you drop.', category: 'ACADEMICS', cost: { energy: 80, physiological: { sanity: -15 } }, effect: { physiological: { stress: 20 }, skills: { experiment: 15, analysis: 15 } }, logMessage: "Pulled a triple shift." }]
    },
    {
        id: 'LAB_MOM',
        name: 'Prof. Linda Care',
        title: 'Associate Professor',
        institution: 'Wellness University',
        imageColor: 'bg-pink-500',
        reputation: 50,
        initialFunding: 100000,
        description: 'Treats the lab like family. Good for sanity, bad for deadlines.',
        initialModifiers: { career: { supervisorRel: 10 }, physiological: { sanity: 20, stress: -10 } },
        weeklyModifier: { description: "Team lunch. Sanity +3, Energy -5.", effect: { physiological: { sanity: 3 }, energy: -5 } },
        exclusiveActions: [{ id: 'VENT_SESSION', label: 'Cry in Office', description: 'Safe space.', category: 'ACADEMICS', cost: { energy: 5 }, effect: { physiological: { sanity: 30, stress: -20 }, career: { supervisorRel: 5 } }, logMessage: "Cried in her office. Got chocolate." }]
    }
];

export const ACTIONS_DATA = {
    SLEEP: { id: 'SLEEP', label: 'Sleep In', description: 'Catch up on zzz\'s.', category: 'LIFE', cost: { funds: 0 }, effect: { energy: 30, physiological: { stress: -10, health: 2 } }, logMessage: "Slept for 12 hours. Dreams were weird." },
    EXERCISE: { id: 'EXERCISE', label: 'Gym / Run', description: 'Sweat out the anxiety.', category: 'LIFE', cost: { energy: 15 }, effect: { physiological: { stress: -20, sanity: 5, health: 5 }, talents: { focus: 2 } }, logMessage: "Hit the gym." },
    READ_PAPERS: { id: 'READ_PAPERS', label: 'Read Literature', description: 'Keep up with state of the art.', category: 'ACADEMICS', cost: { energy: 10, physiological: { stress: 2 } }, effect: { skills: { reading: 5, analysis: 2 }, talents: { logic: 1 }, career: { meetingPreparation: 5 } }, logMessage: "Read 10 papers. Understood 2." },
    MEET_SUPERVISOR: { id: 'MEET_SUPERVISOR', label: 'Meet Advisor', description: 'Initiate a meeting.', category: 'ACADEMICS', cost: { energy: 15, physiological: { stress: 10 } }, effect: { career: { supervisorRel: 10 }, skills: { timeManagement: 2 }, physiological: { stress: 10 } }, logMessage: "Meeting initiated." },
    TAKE_LOAN: { id: 'TAKE_LOAN', label: 'Student Loan', description: 'Borrow $5000.', category: 'LIFE', cost: { energy: 10, physiological: { stress: 20, sanity: -20 } }, effect: { funds: 5000 }, logMessage: "Took a predatory loan." },
    THERAPY: { id: 'THERAPY', label: 'Therapy', description: 'Professional help.', category: 'SELF_IMPROVEMENT', cost: { funds: 120 }, effect: { physiological: { sanity: 25, stress: -10 }, talents: { resilience: 5 } }, logMessage: "Therapy session." }
};
