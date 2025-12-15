import { GameState, GamePhase, ResearchField, GameAction, PlayerStats, BackgroundOption, SupervisorProfile, MandatoryTask } from '../types';

export const INITIAL_STATS: PlayerStats = {
  energy: 100, // New Base
  funds: 3000, // New Base
  physiological: {
    health: 100,
    stress: 10,
    sanity: 100
  },
  talents: {
    creativity: 30, // New Base
    focus: 30,      // New Base
    logic: 30,      // New Base
    resilience: 30  // New Base
  },
  skills: {
    timeManagement: 20, // New Base
    reading: 20,        // New Base
    writing: 20,        // New Base
    experiment: 20,     // New Base
    analysis: 20,       // New Base
    presentation: 20    // New Base
  },
  career: {
    supervisorRel: 25, 
    reputation: 0,
    meetingExpectation: 20,
    meetingPreparation: 0
  }
};

// Default Max values
export const MAX_STATS: PlayerStats = {
  energy: 100,
  funds: 999999, 
  physiological: {
    health: 100,
    stress: 100,
    sanity: 100
  },
  talents: {
    creativity: 100,
    focus: 100,
    logic: 100,
    resilience: 100
  },
  skills: {
    timeManagement: 100,
    reading: 100,
    writing: 100,
    experiment: 100,
    analysis: 100,
    presentation: 100
  },
  career: {
    supervisorRel: 100,
    reputation: 999999,
    meetingExpectation: 100,
    meetingPreparation: 100
  }
};

export const WEEKLY_RENT = 500;
export const WEEKLY_LAB_COST = 2000; 

export const INITIAL_GAME_STATE: GameState = {
  turn: 1,
  phase: GamePhase.SETUP,
  field: ResearchField.PHYSICS, 
  stats: JSON.parse(JSON.stringify(INITIAL_STATS)), 
  maxStats: JSON.parse(JSON.stringify(MAX_STATS)), 
  currentRent: WEEKLY_RENT,
  mandatoryTask: null,
  playerDebt: 0, 
  loanDeadline: null,
  activeProject: null,
  availableIdeas: [], 
  publishedPapers: [],
  logs: [],
  loading: false
};


export const COST = {
  RESEARCH: { energy: 15, funds: 0 },
  WRITE_PAPER: { energy: 20, funds: 0 },
  CONFERENCE: { energy: 10, funds: 800 },
  WORK_TASK: { energy: 15 },
  DEVELOP_IDEA: { energy: 20, physiological: { stress: 10 } } 
};

export const WIN_CONDITION_REPUTATION = 500;
export const WIN_CONDITION_PAPERS = 3;

export const CONFIRMATION_TASK: MandatoryTask = {
  id: 'CONFIRMATION',
  title: 'Confirmation of Candidature',
  description: 'You must pass your confirmation review (qualifying exam) before Week 52. If you fail, you will be expelled.',
  progress: 0,
  totalEffort: 300, 
  deadline: 52
};

export const YEAR_2_REVIEW_TASK: MandatoryTask = {
  id: 'YEAR_2_REVIEW',
  title: '2nd Year Review',
  description: 'Mid-candidature review. Ensure your research is on track.',
  progress: 0,
  totalEffort: 200,
  deadline: 104 
};

// --- NEW SETUP DATA ---

export const BACKGROUND_POOL: BackgroundOption[] = [
  {
    id: 'RICH_KID',
    name: 'Preston Sterling III',
    education: 'BA Art History, Ivy League (Legacy)',
    description: 'Never washed a dish in his life. Treating the PhD as a "gap decade".',
    imageColor: 'bg-emerald-600',
    personality: { workStyle: 80, motivation: 20 },
    initialModifiers: {
      funds: 8500, // Total 11500
      energy: -15, // Lazy, Total 85
      physiological: { stress: -12, sanity: 5 } as any,
      skills: { timeManagement: -8, experiment: -14, presentation: 12, writing: -5 } as any,
      talents: { resilience: -12, creativity: 8 } as any
    },
    weeklyModifier: {
      description: "Allowance from Dad arrived. +$500.",
      stats: {},
      effect: { funds: 500 }
    },
    maxStatModifiers: {
      energy: -20, // Max 80: Lazy
      physiological: { stress: 30 } as any // Max 130: Oblivious to reality
    },
    exclusiveActions: [
      {
        id: 'RETAIL_THERAPY',
        label: 'Retail Therapy',
        description: 'Buy happiness.',
        category: 'LIFE',
        cost: { funds: 800, energy: 5 },
        effect: { physiological: { stress: -50, sanity: 20 } },
        logMessage: "Bought a limited edition watch. You feel empty but stylish."
      }
    ]
  },
  {
    id: 'INFLUENCER',
    name: 'Tiffany Sun-Yang',
    education: 'BA Marketing, Social Media Influencer',
    description: 'Majoring in marketing. Actually majoring in Instagram.',
    imageColor: 'bg-pink-400',
    personality: { workStyle: 70, motivation: 30 },
    initialModifiers: {
      funds: 4200, // Total 7200
      energy: -12, // Total 88
      physiological: { health: -10, stress: 10, sanity: -5 } as any, 
      talents: { 
        creativity: 8, // 38
        focus: -12, // 18
        logic: -8, // 22
        resilience: -2 // 28
      } as any,
      skills: { 
        timeManagement: -12, // 8
        reading: -14, // 6
        writing: -8, // 12
        experiment: -15, // 5
        analysis: -14, // 6
        presentation: 45 // 65 (God tier)
      } as any
    },
    weeklyModifier: {
      description: "Retail Therapy addiction. Funds -$200, Sanity +5, Stress -5.",
      stats: {},
      effect: {
        funds: -200,
        physiological: { sanity: 5, stress: -5 }
      }
    },
    maxStatModifiers: {
      energy: -10, // Max 90
      physiological: { sanity: -20 } as any // Max 80: Social media toxicity
    },
    exclusiveActions: [
      {
        id: 'SPONSORED_POST',
        label: 'Sponsored Content',
        description: '#Ad #Hustle',
        category: 'LIFE',
        cost: { energy: 20 },
        effect: { funds: 800, physiological: { stress: 10 } },
        logMessage: "Posted a skincare routine video. The comments are mean, but the money is real."
      }
    ]
  },
  {
    id: 'GENIUS',
    name: 'Aarav Patel',
    education: 'PhD (Math) at age 16, now trying Physics',
    description: 'Intellectually brilliant, but has the social skills of a brick and high anxiety.',
    imageColor: 'bg-fuchsia-600',
    personality: { workStyle: 70, motivation: 90 },
    initialModifiers: {
      funds: -1500, // Total 1500 (Scholarship only)
      talents: { logic: 42, creativity: 28, resilience: -15 } as any, // Logic 72
      skills: { presentation: -18, writing: -8, analysis: 22, reading: 15 } as any,
      physiological: { sanity: -15, stress: 15, health: -5 } as any
    },
    weeklyModifier: {
      description: "Gifted Kid Burnout kicks in. Stress +3, Logic +1.",
      stats: {},
      effect: { 
        physiological: { stress: 3 },
        talents: { logic: 1 }
      }
    },
    maxStatModifiers: {
      energy: 20, // Max 120: Manic episodes
      physiological: { sanity: -30, stress: -20 } as any // Max 70/80: Very fragile
    },
    exclusiveActions: [
      {
        id: 'EUREKA',
        label: 'Brain Blast',
        description: 'Go into a trance.',
        category: 'ACADEMICS',
        cost: { energy: 40, physiological: { sanity: -10 } } as any,
        effect: { talents: { logic: 10, creativity: 10 }, physiological: { stress: 10 } },
        logMessage: "Stared at the blackboard for 6 hours. The solution appeared in a hallucination."
      }
    ]
  },
  {
    id: 'GAMBLER',
    name: 'Jax "All-In" Mendez',
    education: 'BSc Statistics, Online Poker Pro',
    description: 'Lost their tuition money on crypto. Starts with huge debt but high risk tolerance.',
    imageColor: 'bg-red-700',
    personality: { workStyle: 90, motivation: 70 },
    initialDebt: 8000,
    initialModifiers: {
      funds: 2000, // Total 5000 (Liquid cash, but high debt)
      talents: { logic: 20, focus: -10 } as any,
      physiological: { stress: -20 } as any // Numb to stress
    },
    weeklyModifier: {
      description: "Debt Anxiety vs Thrill. Stress +5, Sanity -2.",
      stats: {},
      effect: { 
        physiological: { stress: 5, sanity: -2 }
      }
    },
    maxStatModifiers: {
      physiological: { stress: 30, sanity: -30 } as any // Can handle insane stress, but goes crazy
    },
    exclusiveActions: [
      {
        id: 'DAY_TRADING',
        label: 'Day Trading',
        description: 'High risk, high reward.',
        category: 'LIFE',
        cost: { energy: 10, funds: 500, physiological: { stress: 10 } } as any,
        effect: { funds: 1000 }, // 50% profit margin on avg, but gambling is handled in logic? No, static for now.
        logMessage: "Made some risky trades. It paid off... this time."
      }
    ]
  },
  {
    id: 'CAREER_SWITCHER',
    name: 'Eleanor Vance',
    education: 'Former Corporate Lawyer',
    description: 'Left a high-paying job to pursue passion. Carries "lifestyle debt" from previous life.',
    imageColor: 'bg-slate-500',
    personality: { workStyle: 10, motivation: 90 },
    initialDebt: 5000,
    initialModifiers: {
      funds: 4000, // Total 7000
      skills: { timeManagement: 30, presentation: 20, writing: 15 } as any,
      talents: { resilience: 20 } as any,
      physiological: { health: -15, energy: -20 } as any
    },
    weeklyModifier: {
      description: "Mortgage payments due. Funds -$100, Resilience +1.",
      stats: {},
      effect: {
        funds: -100,
        talents: { resilience: 1 }
      }
    },
    maxStatModifiers: {
      energy: -30, // Older, tired
      skills: { timeManagement: 20 } as any
    },
    exclusiveActions: [
      {
        id: 'CONSULTING',
        label: 'Freelance Consult',
        description: 'Use your old skills.',
        category: 'LIFE',
        cost: { energy: 30, physiological: { stress: 10 } } as any,
        effect: { funds: 1200, physiological: { sanity: -5 } },
        logMessage: "Did some consulting work. Good money, but soul-crushing."
      }
    ]
  },
  {
    id: 'INDUSTRY',
    name: 'Elena Rodriguez',
    education: 'MBA, Top 10 Business School',
    description: 'Spent 10 years in Corpo. Uses buzzwords like "synergy". Here to "disrupt" science.',
    imageColor: 'bg-blue-600',
    personality: { workStyle: 10, motivation: 10 },
    initialModifiers: {
      funds: 5500, // Total 8500
      skills: { presentation: 15, timeManagement: 25, reading: -12, writing: -5 } as any,
      career: { reputation: 15 } as any,
      talents: { focus: -8, logic: 5 } as any
    },
    weeklyModifier: {
      description: "Consulting side-hustle call. Funds +$200, Energy -10.",
      stats: {},
      effect: { 
        funds: 200,
        energy: -10
      }
    },
    maxStatModifiers: {
      energy: 10, // Max 110: Corporate stamina
      physiological: { stress: 10 } as any // Max 110: Thick skin
    },
    exclusiveActions: [
      {
        id: 'DELEGATE',
        label: 'Outsource',
        description: 'Pay someone else to do it.',
        category: 'ACADEMICS',
        cost: { funds: 400, energy: 0 },
        effect: { skills: { experiment: 5, analysis: 5 }, physiological: { stress: -5 } },
        logMessage: "Paid an undergrad to run your samples. Efficient."
      }
    ]
  },
  {
    id: 'GRINDER',
    name: 'Sarah Smith',
    education: 'BS, State University (Summa Cum Laude)',
    description: 'Runs entirely on caffeine and spite. Will outlast the cockroaches.',
    imageColor: 'bg-slate-700',
    personality: { workStyle: 20, motivation: 60 },
    initialModifiers: {
      funds: -2200, // Total 800 (Very Poor)
      energy: 25, // Total 125
      talents: { resilience: 35, focus: 5 } as any,
      skills: { experiment: 12, analysis: 2, writing: 2 } as any,
      physiological: { health: -10, stress: 15 } as any
    },
    weeklyModifier: {
      description: "Powered through the pain. Energy +10, Health -2.",
      stats: {},
      effect: { 
        energy: 10,
        physiological: { health: -2 }
      }
    },
    maxStatModifiers: {
      energy: 50, // Max 150: The Machine
      physiological: { health: -30, stress: 40 } as any // Max Health 70 (Frail), Max Stress 140 (Numb)
    }
  },
  {
    id: 'INTERNATIONAL',
    name: 'Wei Chen',
    education: 'MSc, Top University in Home Country',
    description: 'Brilliant researcher, but 50% of brain power is used worrying about immigration paperwork.',
    imageColor: 'bg-red-500',
    personality: { workStyle: 30, motivation: 80 },
    initialModifiers: {
      funds: 2000,
      talents: { 
          creativity: -12, // 18
          focus: 13,      // 43
          logic: 18,      // 48
          resilience: -22 // 8
      } as any,
      skills: { 
          timeManagement: -11, // 9
          reading: 12,         // 32
          writing: -8,         // 12
          experiment: 12,      // 32
          analysis: 21,        // 41
          presentation: -17    // 3
      } as any,
      physiological: { } as any
    },
    weeklyModifier: {
      description: "Visa anxiety. Stress +5.",
      stats: {},
      effect: {
        physiological: { stress: 5 }
      }
    },
    maxStatModifiers: {
        energy: 20, // Max 120
        physiological: { stress: 50, sanity: -20 } as any // Max 150, Max 80
    },
    exclusiveActions: [
      {
        id: 'CALL_HOME',
        label: 'Call Home',
        description: 'Family support. Lowers stress & sanity boost.',
        category: 'LIFE',
        cost: { energy: 10 },
        effect: { physiological: { stress: -15, sanity: 10 }, funds: 100 },
        logMessage: "Called parents. They transferred some money and calmed you down."
      },
      {
        id: 'WEEKEND_OVERTIME',
        label: 'Weekend Overtime',
        description: 'Work while others sleep. High burnout risk. Boosts Progress.',
        category: 'ACADEMICS',
        cost: { energy: 0 },
        effect: { physiological: { stress: 25, health: -10, sanity: -10 } },
        logMessage: "Worked through the weekend. Progress made, but at what cost?"
      }
    ]
  },
  {
    id: 'IDEALIST',
    name: 'Zara Al-Fayed',
    education: 'BA, Liberal Arts College',
    description: 'Passionate about changing the world. Often distracted by department politics and causes.',
    imageColor: 'bg-orange-500',
    personality: { workStyle: 80, motivation: 100 },
    initialModifiers: {
      physiological: { sanity: 15, stress: -5 } as any,
      talents: { creativity: 18, focus: -14, resilience: 10 } as any,
      career: { reputation: 0, supervisorRel: -10 } as any,
      funds: -1200 // Total 1800
    },
    weeklyModifier: {
      description: "Organized a student union meeting. Sanity +3, Energy -5.",
      stats: {},
      effect: {
        physiological: { sanity: 3 },
        energy: -5
      }
    },
    maxStatModifiers: {
        energy: -10, // Max 90
        physiological: { sanity: 30 } as any // Max 130: Purpose driven
    },
    exclusiveActions: [
      {
        id: 'PROTEST',
        label: 'Organize Protest',
        description: 'Fight the power.',
        category: 'SOCIAL',
        cost: { energy: 30 },
        effect: { physiological: { sanity: 20 }, career: { reputation: -5 } },
        logMessage: "Protested against bad coffee in the lounge. You felt alive."
      }
    ]
  },
  {
    id: 'PARENT',
    name: 'David Okafor',
    education: 'Returning student after 5 years',
    description: 'Has two toddlers at home. Time management is god-tier, but sleep is a myth.',
    imageColor: 'bg-indigo-600',
    personality: { workStyle: 0, motivation: 50 },
    initialModifiers: {
      skills: { timeManagement: 55, analysis: -5 } as any, // Total 75 Time Mgmt
      physiological: { health: -14, stress: 15 } as any,
      talents: { resilience: 12, focus: -5 } as any,
      energy: -40, // Total 60
      funds: -1500 // Total 1500
    },
    weeklyModifier: {
      description: "Kids woke up at 4AM. Energy -10, Time Mgmt +1.",
      stats: {},
      effect: {
        energy: -10,
        skills: { timeManagement: 1 }
      }
    },
    maxStatModifiers: {
      energy: -40, // Max 60: Permanently exhausted
      talents: { resilience: 30 } as any // Max 130: Parents are tough
    },
    exclusiveActions: [
      {
        id: 'POWER_NAP',
        label: 'Power Nap',
        description: 'Mastery of sleep.',
        category: 'LIFE',
        cost: { energy: 0 },
        effect: { energy: 25, physiological: { stress: -5 } },
        logMessage: "Slept for exactly 18 minutes in the car. Refreshed."
      }
    ]
  },
  {
    id: 'LATE_BLOOMER',
    name: 'Kenji Sato',
    education: 'Retired Engineer, 65 years old',
    description: 'Doing this for fun. Has infinite patience and life experience, but lower stamina.',
    imageColor: 'bg-teal-600',
    personality: { workStyle: 60, motivation: 90 },
    initialModifiers: {
      physiological: { sanity: 25, health: -25 } as any,
      talents: { resilience: 15, logic: 5 } as any,
      skills: { writing: 12, experiment: 8, presentation: -5 } as any,
      funds: 15000, // Total 18000
      energy: -25 // Total 75
    },
    weeklyModifier: {
      description: "Wisdom of age. Sanity +2, Energy -5.",
      stats: {},
      effect: {
        physiological: { sanity: 2 },
        energy: -5
      }
    },
    maxStatModifiers: {
      energy: -30, // Max 70
      physiological: { health: -40, sanity: 40 } as any // Max Health 60, Max Sanity 140 (Zen)
    }
  }
];

export const SUPERVISOR_POOL: SupervisorProfile[] = [
  {
    id: 'PUSH',
    name: 'Prof. Richard "Dick" Push',
    title: 'Distinguished Professor',
    institution: 'Institute of High Energy Stress',
    imageColor: 'bg-red-600',
    stats: { citations: 45200, hIndex: 85, i10Index: 312 },
    reputation: 95,
    initialFunding: 500000,
    description: 'World famous. Demands perfection. You will be famous, if you survive.',
    personality: { workStyle: 10, motivation: 20 }, // Rigid, Prestige-driven
    initialModifiers: {
      career: { reputation: 100, supervisorRel: 5 } as any,
      physiological: { stress: 20 } as any
    },
    weeklyModifier: {
      description: "Prof. Push sent a 'kind reminder' at 3 AM. Stress +5, Rep +2.",
      stats: {},
      effect: {
        physiological: { stress: 5 },
        career: { reputation: 2 }
      }
    },
    maxStatModifiers: {
      physiological: { stress: 20 } as any, // You get used to high stress (Max 120)
    },
    exclusiveActions: [
      {
        id: 'CRUNCH_TIME',
        label: 'Crunch Time',
        description: 'Work until you drop.',
        category: 'ACADEMICS',
        cost: { energy: 80, physiological: { sanity: -15 } } as any,
        effect: { physiological: { stress: 20 }, skills: { experiment: 15, analysis: 15 } },
        logMessage: "Pulled a triple shift. You smell like ozone and despair."
      }
    ],
    meetingConfig: {
        expectationGrowth: 15, // Very high pressure
        expectationCap: 100,
        preparationCap: 100,
        patience: 0.2 // Low tolerance for unpreparedness
    }
  },
  {
    id: 'GHOST',
    name: 'Dr. Invisibilis',
    title: 'Professor Emeritus',
    institution: 'Center for Absentee Studies',
    imageColor: 'bg-slate-300',
    stats: { citations: 12000, hIndex: 45, i10Index: 120 },
    reputation: 60,
    initialFunding: 50000,
    description: 'Tenured and tired. You won\'t see them, but they won\'t bother you.',
    personality: { workStyle: 90, motivation: 10 }, // Chaotic (Absent), Low Motivation
    initialModifiers: {
      career: { supervisorRel: 0 } as any,
      physiological: { sanity: 10 } as any
    },
    weeklyModifier: {
      description: "No meetings this week (again). Stress -2, Rep -1.",
      stats: {},
      effect: {
        physiological: { stress: -2 },
        career: { reputation: -1 }
      }
    },
    maxStatModifiers: {
      career: { supervisorRel: -20, reputation: -20 } as any, // Hard to build rel/rep
      skills: { analysis: 10 } as any // Forced to be independent
    },
    exclusiveActions: [
      {
        id: 'SELF_GUIDED',
        label: 'Self-Study',
        description: 'Figure it out yourself.',
        category: 'ACADEMICS',
        cost: { energy: 20, stress: 5 },
        effect: { talents: { logic: 5, resilience: 2 } },
        logMessage: "Spent 3 days on StackExchange. Fixed the issue."
      }
    ],
    meetingConfig: {
        expectationGrowth: 2, // Very low pressure
        expectationCap: 100,
        preparationCap: 50, // Low standards
        patience: 1.0 // Doesn't really care
    }
  },
  {
    id: 'NEWBIE',
    name: 'Dr. Sarah Fresh',
    title: 'Assistant Professor',
    institution: 'Department of Desperation',
    imageColor: 'bg-green-500',
    stats: { citations: 450, hIndex: 8, i10Index: 7 },
    reputation: 20,
    initialFunding: 80000,
    description: 'Needs tenure BADLY. Has grant money, but will micromanage your soul.',
    personality: { workStyle: 15, motivation: 30 }, // Very Rigid (Anxious), Prestige/Survival driven
    initialModifiers: {
      funds: 1000, // Startup grant
      career: { supervisorRel: 15, reputation: -10 } as any
    },
    weeklyModifier: {
      description: "Dr. Fresh hovered over your desk. Stress +3, Funds +$50 (Coffee).",
      stats: {},
      effect: {
        physiological: { stress: 3 },
        funds: 50
      }
    },
    maxStatModifiers: {
       energy: -10, // Micromanagement drains you
       funds: 10000 // Grants!
    },
    exclusiveActions: [
      {
        id: 'GRANT_WRITING',
        label: 'Write Grant',
        description: 'Help her get tenure.',
        category: 'ACADEMICS',
        cost: { energy: 40, physiological: { stress: 10 } } as any,
        effect: { funds: 1500, career: { supervisorRel: 15 } },
        logMessage: "Wrote a grant application. She took all the credit, but you got funded."
      }
    ],
    meetingConfig: {
        expectationGrowth: 20, // High anxiety/micromanagement
        expectationCap: 80, // Needs reassurance often
        preparationCap: 100,
        patience: 0.5 
    }
  },
  {
    id: 'LAB_MOM',
    name: 'Prof. Linda Care',
    title: 'Associate Professor',
    institution: 'Wellness University',
    imageColor: 'bg-pink-500',
    stats: { citations: 5200, hIndex: 28, i10Index: 65 },
    reputation: 50,
    initialFunding: 100000,
    description: 'Treats the lab like a family. Good for sanity, bad for deadlines.',
    personality: { workStyle: 60, motivation: 80 }, // Flexible, Passionate/Caring
    initialModifiers: {
      career: { supervisorRel: 10 } as any,
      physiological: { sanity: 20, stress: -10 } as any,
      talents: { resilience: 10 } as any
    },
    weeklyModifier: {
      description: "Team building lunch! Sanity +3, Energy -5.",
      stats: {},
      effect: {
        physiological: { sanity: 3 },
        energy: -5
      }
    },
    maxStatModifiers: {
       physiological: { sanity: 20, stress: -20 } as any, // High sanity cap, low stress tolerance
    },
    exclusiveActions: [
      {
        id: 'VENT_SESSION',
        label: 'Cry in Office',
        description: 'Safe space.',
        category: 'ACADEMICS',
        cost: { energy: 5 },
        effect: { physiological: { sanity: 30, stress: -20 }, career: { supervisorRel: 5 } },
        logMessage: "Cried in her office. She gave you chocolate."
      }
    ],
    meetingConfig: {
        expectationGrowth: 5, // Low pressure
        expectationCap: 100,
        preparationCap: 80, 
        patience: 1.0 // Very forgiving
    }
  },
  {
    id: 'VISIONARY',
    name: 'Prof. Zephyr Vance',
    title: 'Director of Future Studies',
    institution: 'Institute of Nebulous Concepts',
    imageColor: 'bg-violet-600',
    stats: { citations: 15000, hIndex: 55, i10Index: 180 },
    reputation: 75,
    initialFunding: 200000,
    description: 'Has ideas that will change the world. Has no idea how to implement them.',
    personality: { workStyle: 100, motivation: 100 }, // Pure Chaos, Pure Passion
    initialModifiers: {
      talents: { creativity: 30, focus: -10 } as any,
      career: { reputation: 30, supervisorRel: 0 } as any
    },
    weeklyModifier: {
      description: "Prof. Vance changed the project scope again. Creativity +2, Focus -3.",
      stats: {},
      effect: {
        talents: { creativity: 2, focus: -3 }
      }
    },
    maxStatModifiers: {
      talents: { creativity: 30, focus: -30 } as any
    },
    exclusiveActions: [
      {
        id: 'BRAINSTORM_SESH',
        label: 'Wild Idea',
        description: 'Pivot the project.',
        category: 'ACADEMICS',
        cost: { energy: 30, physiological: { sanity: -5 } } as any,
        effect: { talents: { creativity: 15 }, activeProject: { potential: 2 } } as any, // Hacky potential boost
        logMessage: "Pivot! Pivot! The project is now about quantum llamas."
      }
    ],
    meetingConfig: {
        expectationGrowth: 10, 
        expectationCap: 100,
        preparationCap: 120, // Needs REALLY new ideas
        patience: 0.8 
    }
  },
  {
    id: 'OLD_GUARD',
    name: 'Prof. Arthur Oldman',
    title: 'Senior Fellow',
    institution: 'Traditional University',
    imageColor: 'bg-amber-800',
    stats: { citations: 8000, hIndex: 35, i10Index: 90 },
    reputation: 65,
    initialFunding: 80000,
    description: 'Still uses overhead projectors. Thinks Python is a snake. Stick to the basics.',
    personality: { workStyle: 5, motivation: 10 }, // Rigid, Low Passion (Stuck in ways)
    initialModifiers: {
      skills: { writing: 20, experiment: -10 } as any,
      career: { supervisorRel: 5 } as any
    },
    weeklyModifier: {
      description: "Long lecture about the 'good old days'. Sanity -2, Writing +1.",
      stats: {},
      effect: {
        physiological: { sanity: -2 },
        skills: { writing: 1 }
      }
    },
    maxStatModifiers: {
       skills: { writing: 20, presentation: -20 } as any // Good writer, bad at modern slides
    },
    exclusiveActions: [
      {
        id: 'ARCHIVE_DIG',
        label: 'Library Dig',
        description: 'Read physical books.',
        category: 'ACADEMICS',
        cost: { energy: 15 },
        effect: { talents: { focus: 5 }, skills: { reading: 8 } },
        logMessage: "Found a seminal paper from 1954. Smells like dust."
      }
    ],
    meetingConfig: {
        expectationGrowth: 8, 
        expectationCap: 100,
        preparationCap: 80, 
        patience: 0.4 // Expects formality
    }
  },
  {
    id: 'POLITICIAN',
    name: 'Dr. Gregory Handshake',
    title: 'Department Chair',
    institution: 'Ivy League Inc.',
    imageColor: 'bg-cyan-600',
    stats: { citations: 25000, hIndex: 60, i10Index: 200 },
    reputation: 85,
    initialFunding: 300000,
    description: 'Knows everyone. Is never in the lab because he is at a conference in Hawaii.',
    personality: { workStyle: 80, motivation: 5 }, // Flexible (Absent), Prestige driven
    initialModifiers: {
      career: { reputation: 50, supervisorRel: -10 } as any,
      funds: 3000
    },
    weeklyModifier: {
      description: "Introduced you to a Nobel Laureate. Rep +5, Energy -10 (Schmoozing).",
      stats: {},
      effect: {
        career: { reputation: 5 },
        energy: -10
      }
    },
    maxStatModifiers: {
       career: { reputation: 200 } as any // Rep cap boost
    },
    exclusiveActions: [
      {
        id: 'SCHMOOZE',
        label: 'Networking',
        description: 'Attend gala dinner.',
        category: 'SOCIAL',
        cost: { funds: 200, energy: 20 },
        effect: { career: { reputation: 25, supervisorRel: 5 } },
        logMessage: "Drank expensive wine. Pretended to understand economics."
      }
    ],
    meetingConfig: {
        expectationGrowth: 5, // Often absent
        expectationCap: 150, // Long periods without meeting
        preparationCap: 90, 
        patience: 0.8 
    }
  },
  {
    id: 'DIY_GUY',
    name: 'Dr. Aris "Shoestring" Thorne',
    title: 'Lab Manager / Lecturer',
    institution: 'Basement Science Annex',
    imageColor: 'bg-amber-600',
    stats: { citations: 1200, hIndex: 12, i10Index: 15 },
    reputation: 40,
    initialFunding: 25000,
    description: 'Your centrifuge is a salad spinner taped to a drill. Can fix anything with duct tape.',
    personality: { workStyle: 80, motivation: 90 }, // Chaotic, High Passion
    initialModifiers: {
      talents: { creativity: 25, resilience: 30 } as any,
      funds: -500 // You buy your own safety goggles
    },
    weeklyModifier: {
      description: "Saved money by repairing the autoclave yourself. Funds +0 (Saved), Energy -5.",
      stats: {},
      effect: {
        energy: -5,
        skills: { experiment: 1 }
      }
    },
    maxStatModifiers: {
       talents: { resilience: 20 } as any,
       career: { reputation: -10 } as any // Hard to get respect with DIY gear
    },
    exclusiveActions: [
      {
        id: 'SCAVENGE',
        label: 'Dumpster Dive',
        description: 'Find spare parts.',
        category: 'ACADEMICS',
        cost: { energy: 10, physiological: { stress: 2 } } as any,
        effect: { funds: 100, activeProject: { resources: 5 } } as any, 
        logMessage: "Found a working oscilloscope in the trash! It only sparks sometimes."
      }
    ],
    meetingConfig: {
        expectationGrowth: 5, 
        expectationCap: 100,
        preparationCap: 60, // Doesn't care about slides, show results
        patience: 0.9 
    }
  },
  {
    id: 'THEORIST',
    name: 'Prof. Beatrice "Budget" Moore',
    title: 'Senior Theoretician',
    institution: 'Institute of Pure Thought',
    imageColor: 'bg-slate-500',
    stats: { citations: 9000, hIndex: 40, i10Index: 85 },
    reputation: 65,
    initialFunding: 8000,
    description: 'Has not applied for a grant since 1998. "Why do you need money? You have a brain."',
    personality: { workStyle: 10, motivation: 50 }, // Rigid, Pure Academic
    initialModifiers: {
      talents: { logic: 40, creativity: -10 } as any,
      skills: { experiment: -30 } as any,
      funds: -1000
    },
    weeklyModifier: {
      description: "She refused to buy simulation software. 'Do the math by hand.' Logic +2.",
      stats: {},
      effect: {
        talents: { logic: 2 },
        skills: { experiment: -1 }
      }
    },
    maxStatModifiers: {
       talents: { logic: 30 } as any,
       funds: -10000 // You will be poor
    },
    exclusiveActions: [
      {
        id: 'THOUGHT_EXP',
        label: 'Pen & Paper',
        description: 'Cheap and effective.',
        category: 'ACADEMICS',
        cost: { energy: 5 },
        effect: { talents: { logic: 5 }, skills: { analysis: 5 }, physiological: { stress: -5 } },
        logMessage: "Solved the problem on a napkin. Total cost: $0.02."
      }
    ],
    meetingConfig: {
        expectationGrowth: 10, 
        expectationCap: 100,
        preparationCap: 90, 
        patience: 0.3 // Hates wasting time/money
    }
  },
  {
    id: 'KENSINGTON',
    name: 'Prof. Lionel R. Kensington',
    title: 'Distinguished Chair',
    institution: 'Global Institute of Wealth',
    imageColor: 'bg-emerald-800',
    stats: { citations: 65000, hIndex: 110, i10Index: 450 },
    reputation: 90,
    initialFunding: 1000000,
    description: 'Runs the lab like a hedge fund. "Results or resignation."',
    personality: { workStyle: 10, motivation: 0 }, // Very rigid, Money driven
    initialModifiers: {
        physiological: { stress: 15 } as any // Intimidating
    },
    weeklyModifier: {
        description: "Reviewing budgets. Sanity -10, Lab Funds +$2000.",
        stats: {},
        effect: {
            physiological: { sanity: -10 }
            // Lab funding handled in logic
        }
    },
    maxStatModifiers: {
        physiological: { stress: -10 } as any // Lower stress cap (you are always stressed)
    },
    meetingConfig: {
        expectationGrowth: 1, // Almost never meets
        expectationCap: 200,
        preparationCap: 100,
        patience: 0.1 // Zero tolerance
    },
    exclusiveActions: [
        {
            id: 'BUY_RESULTS',
            label: 'Outsource Experiments',
            description: 'Spend lab money to buy data.',
            category: 'ACADEMICS',
            cost: { energy: 10, physiological: { stress: 5 } } as any, // Funds cost handled dynamically
            effect: { career: { supervisorRel: -5 } } as any, // He dislikes you not doing it, but likes results
            logMessage: "Paid a CRO to run the samples. Fast but soulless."
        }
    ]
  },
  {
    id: 'AMBER',
    name: 'Assoc. Prof. Amber Wang',
    title: 'Associate Professor',
    institution: 'City Tech',
    imageColor: 'bg-purple-500',
    stats: { citations: 3200, hIndex: 18, i10Index: 25 },
    reputation: 45,
    initialFunding: 60000,
    description: 'Rising star with high anxiety. "Why aren\'t you working?"',
    personality: { workStyle: 20, motivation: 80 }, // Rigid, Passionate
    initialModifiers: {
        physiological: { stress: 10 } as any,
        career: { supervisorRel: 10 } as any
    },
    weeklyModifier: {
        description: "Her mood swings wildly. Relationship fluctuates.",
        stats: {},
        effect: {} // Handled manually
    },
    maxStatModifiers: {
        physiological: { stress: -10, sanity: -20 } as any
    },
    meetingConfig: {
        expectationGrowth: 20, // High pressure
        expectationCap: 60, // Frequent meetings
        preparationCap: 120, // Demanding
        patience: 0.5
    },
    exclusiveActions: [
        {
            id: 'CRISIS_MEETING',
            label: 'Crisis Meeting',
            description: 'Emergency sync.',
            category: 'ACADEMICS',
            cost: { energy: 20 }, // Dynamic reduction
            effect: { career: { supervisorRel: 15 }, physiological: { sanity: -10 } } as any,
            logMessage: "She panicked, you panicked. Bonding occurred."
        }
    ]
  },
  {
    id: 'VANE',
    name: 'Dr. Silas Vane',
    title: 'Associate Professor',
    institution: 'Dark River University',
    imageColor: 'bg-slate-900',
    stats: { citations: 2100, hIndex: 15, i10Index: 12 },
    reputation: 35,
    initialFunding: 120000,
    description: 'Known for "creative" data interpretation. Generous with funds, if you don\'t ask questions.',
    personality: { workStyle: 90, motivation: 10 }, // Chaotic, Low Morals
    initialModifiers: {
        funds: 2000 // Sign-on bonus
    },
    weeklyModifier: {
        description: "Embezzlement scheme active. You receive $1000 hush money.",
        stats: {},
        effect: { } // Handled manually
    },
    maxStatModifiers: {
        career: { reputation: -20 } as any // Stigma
    },
    meetingConfig: {
        expectationGrowth: 2, // Low pressure
        expectationCap: 150, 
        preparationCap: 20, // Doesn't care
        patience: 1.0 
    },
    exclusiveActions: [
        {
            id: 'DATA_MANIPULATION',
            label: 'Massage Data',
            description: 'Fix the outliers. Progress +10%.',
            category: 'ACADEMICS',
            cost: { energy: 20, physiological: { stress: 10, sanity: -5 } } as any, 
            effect: { }, // Handled manually
            logMessage: "Deleted the outliers. The p-value looks perfect now. You feel dirty."
        }
    ]
  }
];


export const ACTIONS_DATA: Record<string, GameAction> = {
  // --- LIFE ---
  SLEEP: {
    id: 'SLEEP',
    label: 'Sleep In',
    description: 'Catch up on zzz\'s.',
    category: 'LIFE',
    cost: { funds: 0 },
    effect: { 
      energy: 30, 
      physiological: { stress: -10, health: 2 } 
    },
    logMessage: "Slept for 12 hours. Dreams were weird."
  },
  EXERCISE: {
    id: 'EXERCISE',
    label: 'Gym / Run',
    description: 'Sweat out the anxiety.',
    category: 'LIFE',
    cost: { energy: 15 },
    effect: { 
      physiological: { stress: -20, sanity: 5, health: 5 },
      talents: { focus: 2 }
    },
    logMessage: "Hit the gym. Physical pain is better than emotional pain."
  },
  GOOD_MEAL: {
    id: 'GOOD_MEAL',
    label: 'Fancy Dinner',
    description: 'Treat yourself to non-instant noodles.',
    category: 'LIFE',
    cost: { funds: 40 },
    effect: { 
      energy: 10, 
      physiological: { stress: -15, health: 1 } 
    },
    logMessage: "Ate something that wasn't beige. Felt human again."
  },
  CLEANING: {
    id: 'CLEANING',
    label: 'Deep Clean',
    description: 'Organize your chaos.',
    category: 'LIFE',
    cost: { energy: 10 },
    effect: { 
      physiological: { sanity: 10, stress: -5 },
      skills: { timeManagement: 2 }
    },
    logMessage: "Cleaned the apartment. Found a molding coffee cup."
  },
  TAKE_LOAN: {
    id: 'TAKE_LOAN',
    label: 'Student Loan',
    description: 'Borrow money to survive. 1% Interest.',
    category: 'LIFE',
    cost: { energy: 10, physiological: { stress: 20, sanity: -20 } } as any,
    effect: { funds: 5000 },
    logMessage: "Took a predatory loan. You can pay rent now, but at what cost?"
  },
  GAMING: {
    id: 'GAMING',
    label: 'Video Games',
    description: 'Escapism at its finest.',
    category: 'LIFE',
    cost: { energy: 5 },
    effect: { 
      physiological: { stress: -15, sanity: 5 },
      talents: { logic: 1 } // Strategy games?
    },
    logMessage: "Played games until 3 AM. No regrets."
  },
  SPACING_OUT: {
    id: 'SPACING_OUT',
    label: 'Space Out',
    description: 'Stare at the wall.',
    category: 'LIFE',
    cost: { energy: 0 },
    effect: { 
      energy: 5, 
      physiological: { stress: -5 } 
    },
    logMessage: "Stared into the void. The void stared back."
  },

  // --- ACADEMICS ---
  PUSH_FUNDING: {
    id: 'PUSH_FUNDING',
    label: 'Demand Funding',
    description: 'Force advisor to write a grant.',
    category: 'ACADEMICS',
    cost: { energy: 30, physiological: { stress: 20 } } as any, // Base Cost
    effect: { 
        physiological: { sanity: -20 }, // Base Cost
        career: { supervisorRel: -5 } 
    },
    logMessage: "Nagged supervisor for money. They weren't happy, but the grant was submitted."
  },
  TA_JOB: {
    id: 'TA_JOB',
    label: 'TA Job',
    description: 'Teach undergrads for cash.',
    category: 'ACADEMICS',
    cost: { energy: 20, stress: 5 },
    effect: { 
      funds: 300, 
      physiological: { stress: 5 },
      skills: { presentation: 3, timeManagement: 1 }
    },
    logMessage: "TA'd a chaotic lab. Undergrads are terrifying."
  },
  READ_PAPERS: {
    id: 'READ_PAPERS',
    label: 'Read Literature',
    description: 'Keep up with the state of the art.',
    category: 'ACADEMICS',
    cost: { energy: 10, stress: 2 },
    effect: { 
      skills: { reading: 5, analysis: 2 },
      talents: { logic: 1 },
      career: { meetingPreparation: 5 } // Reading helps prep
    },
    logMessage: "Read 10 papers. Understood 2 of them."
  },
  ATTEND_SEMINAR: {
    id: 'ATTEND_SEMINAR',
    label: 'Dept Seminar',
    description: 'Free pizza and networking.',
    category: 'ACADEMICS',
    cost: { energy: 5 },
    effect: { 
      skills: { analysis: 2 },
      career: { reputation: 1, meetingPreparation: 2 },
      energy: 5 // Pizza
    },
    logMessage: "Went to a seminar. Mostly for the free pizza."
  },
  MEET_SUPERVISOR: {
    id: 'MEET_SUPERVISOR',
    label: 'Meet Advisor',
    description: 'Initiate a meeting. Requires Preparation.',
    category: 'ACADEMICS',
    cost: { energy: 15, stress: 10 },
    effect: {
      career: { supervisorRel: 10 }, // This is conditional in code
      skills: { timeManagement: 2 },
      physiological: { stress: 10 }
    },
    logMessage: "Meeting initiated."
  },

  // --- SOCIAL ---
  TOUCH_GRASS: {
    id: 'TOUCH_GRASS',
    label: 'Touch Grass',
    description: 'Go outside. Remember nature?',
    category: 'SOCIAL',
    cost: { energy: 5 },
    effect: { 
      physiological: { sanity: 15, stress: -5, health: 2 } 
    },
    logMessage: "Went to the park. The sun hurts."
  },
  DRINK_WITH_LAB: {
    id: 'DRINK_WITH_LAB',
    label: 'Lab Drinks',
    description: 'Complain about reviewers together.',
    category: 'SOCIAL',
    cost: { funds: 50, energy: 10 },
    effect: { 
      physiological: { stress: -20, health: -5 },
      career: { supervisorRel: 5 } // Bonding?
    },
    logMessage: "Got drinks with the lab. Trauma bonding."
  },
  CALL_PARENTS: {
    id: 'CALL_PARENTS',
    label: 'Call Parents',
    description: 'Assure them you are eating.',
    category: 'SOCIAL',
    cost: { energy: 5 },
    effect: { 
      physiological: { sanity: 5 }, 
      funds: 50 
    }, 
    logMessage: "Mom sent 'emergency cookie money'."
  },

  // --- SELF IMPROVEMENT ---
  THERAPY: {
    id: 'THERAPY',
    label: 'Therapy',
    description: 'Professional help is expensive but good.',
    category: 'SELF_IMPROVEMENT',
    cost: { funds: 120 },
    effect: { 
      physiological: { sanity: 25, stress: -10 },
      talents: { resilience: 5 }
    },
    logMessage: "Therapy session. Cried a lot. Felt better."
  },
  LEARN_SKILL: {
    id: 'LEARN_SKILL',
    label: 'Upskill',
    description: 'Learn Python/LaTex/Cooking.',
    category: 'SELF_IMPROVEMENT',
    cost: { energy: 15 },
    effect: { 
      skills: { experiment: 4, writing: 4 }, // Broad upskill
      talents: { creativity: 2 }
    },
    logMessage: "Learned a new skill to procrastinate on research."
  },
  HOBBY: {
    id: 'HOBBY',
    label: 'Hobby',
    description: 'Do something you actually love.',
    category: 'SELF_IMPROVEMENT',
    cost: { funds: 20, energy: 10 },
    effect: { 
      physiological: { sanity: 10, stress: -10 },
      talents: { creativity: 3 }
    },
    logMessage: "Worked on a hobby. Remembered joy exists."
  }
};