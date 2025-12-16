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
  description: 'You must pass your confirmation review (qualifying exam) before Week 52. If you fail, you will be expelled.',
  progress: 0,
  totalEffort: 300,
  deadline: 52
};

export const BACKGROUND_POOL = [
  {
    id: 'RICH_KID',
    name: 'Preston Sterling III',
    education: 'BA Art History, Ivy League (Legacy)',
    description: 'Never washed a dish in his life. Treating the PhD as a "gap decade".',
    imageColor: 'bg-emerald-600',
    personality: { workStyle: 80, motivation: 20 },
    initialModifiers: {
      funds: 8500,
      energy: -15,
      physiological: { stress: -12, sanity: 5 },
      skills: { timeManagement: -8, experiment: -14, presentation: 12, writing: -5 },
      talents: { resilience: -12, creativity: 8 }
    },
    weeklyModifier: { description: "Allowance from Dad arrived. +$500.", stats: {}, effect: { funds: 500 } },
    maxStatModifiers: { energy: -20, physiological: { stress: 30 } },
    exclusiveActions: [{ id: 'RETAIL_THERAPY', label: 'Retail Therapy', description: 'Buy happiness.', category: 'LIFE', cost: { funds: 800, energy: 5 }, effect: { physiological: { stress: -50, sanity: 20 } }, logMessage: "Bought a limited edition watch. You feel empty but stylish." }]
  },
  {
    id: 'GRINDER',
    name: 'Sarah Smith',
    education: 'BS, State University (Summa Cum Laude)',
    description: 'Runs entirely on caffeine and spite. Will outlast the cockroaches.',
    imageColor: 'bg-slate-700',
    personality: { workStyle: 20, motivation: 60 },
    initialModifiers: {
      funds: -2200,
      energy: 25,
      talents: { resilience: 35, focus: 5 },
      skills: { experiment: 12, analysis: 2, writing: 2 },
      physiological: { health: -10, stress: 15 }
    },
    weeklyModifier: { description: "Powered through the pain. Energy +10, Health -2.", stats: {}, effect: { energy: 10, physiological: { health: -2 } } },
    maxStatModifiers: { energy: 50, physiological: { health: -30, stress: 40 } }
  },
  {
    id: 'GENIUS',
    name: 'Aarav Patel',
    education: 'PhD (Math) at age 16',
    description: 'Intellectually brilliant, but has the social skills of a brick.',
    imageColor: 'bg-fuchsia-600',
    personality: { workStyle: 70, motivation: 90 },
    initialModifiers: {
      funds: -1500,
      talents: { logic: 42, creativity: 28, resilience: -15 },
      skills: { presentation: -18, writing: -8, analysis: 22, reading: 15 },
      physiological: { sanity: -15, stress: 15, health: -5 }
    },
    weeklyModifier: { description: "Gifted Kid Burnout. Stress +3, Logic +1.", stats: {}, effect: { physiological: { stress: 3 }, talents: { logic: 1 } } },
    maxStatModifiers: { energy: 20, physiological: { sanity: -30, stress: -20 } },
    exclusiveActions: [{ id: 'EUREKA', label: 'Brain Blast', description: 'Go into a trance.', category: 'ACADEMICS', cost: { energy: 40, physiological: { sanity: -10 } }, effect: { talents: { logic: 10, creativity: 10 }, physiological: { stress: 10 } }, logMessage: "Stared at the blackboard for 6 hours. Solution found." }]
  }
];

export const SUPERVISOR_POOL = [
  {
    id: 'PUSH',
    name: 'Prof. Richard Push',
    title: 'Distinguished Professor',
    institution: 'Institute of High Energy Stress',
    imageColor: 'bg-red-600',
    stats: { citations: 45200, hIndex: 85, i10Index: 312 },
    reputation: 95,
    initialFunding: 500000,
    description: 'World famous. Demands perfection. You will be famous, if you survive.',
    personality: { workStyle: 10, motivation: 20 },
    initialModifiers: { career: { reputation: 100, supervisorRel: 5 }, physiological: { stress: 20 } },
    weeklyModifier: { description: "Prof. Push sent a 'kind reminder' at 3 AM. Stress +5, Rep +2.", stats: {}, effect: { physiological: { stress: 5 }, career: { reputation: 2 } } },
    maxStatModifiers: { physiological: { stress: 20 } },
    exclusiveActions: [{ id: 'CRUNCH_TIME', label: 'Crunch Time', description: 'Work until you drop.', category: 'ACADEMICS', cost: { energy: 80, physiological: { sanity: -15 } }, effect: { physiological: { stress: 20 }, skills: { experiment: 15, analysis: 15 } }, logMessage: "Pulled a triple shift." }],
    meetingConfig: { expectationGrowth: 15, expectationCap: 100, preparationCap: 100, patience: 0.2 }
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
    personality: { workStyle: 60, motivation: 80 },
    initialModifiers: { career: { supervisorRel: 10 }, physiological: { sanity: 20, stress: -10 }, talents: { resilience: 10 } },
    weeklyModifier: { description: "Team building lunch! Sanity +3, Energy -5.", stats: {}, effect: { physiological: { sanity: 3 }, energy: -5 } },
    maxStatModifiers: { physiological: { sanity: 20, stress: -20 } },
    exclusiveActions: [{ id: 'VENT_SESSION', label: 'Cry in Office', description: 'Safe space.', category: 'ACADEMICS', cost: { energy: 5 }, effect: { physiological: { sanity: 30, stress: -20 }, career: { supervisorRel: 5 } }, logMessage: "Cried in her office. She gave you chocolate." }],
    meetingConfig: { expectationGrowth: 5, expectationCap: 100, preparationCap: 80, patience: 1.0 }
  }
];

export const ACTIONS_DATA = {
  SLEEP: { id: 'SLEEP', label: 'Sleep In', description: 'Catch up on zzz\'s.', category: 'LIFE', cost: { funds: 0 }, effect: { energy: 30, physiological: { stress: -10, health: 2 } }, logMessage: "Slept for 12 hours. Dreams were weird." },
  EXERCISE: { id: 'EXERCISE', label: 'Gym / Run', description: 'Sweat out the anxiety.', category: 'LIFE', cost: { energy: 15 }, effect: { physiological: { stress: -20, sanity: 5, health: 5 }, talents: { focus: 2 } }, logMessage: "Hit the gym." },
  READ_PAPERS: { id: 'READ_PAPERS', label: 'Read Literature', description: 'Keep up with the state of the art.', category: 'ACADEMICS', cost: { energy: 10, stress: 2 }, effect: { skills: { reading: 5, analysis: 2 }, talents: { logic: 1 }, career: { meetingPreparation: 5 } }, logMessage: "Read 10 papers. Understood 2 of them." },
  MEET_SUPERVISOR: { id: 'MEET_SUPERVISOR', label: 'Meet Advisor', description: 'Initiate a meeting.', category: 'ACADEMICS', cost: { energy: 15, stress: 10 }, effect: { career: { supervisorRel: 10 }, skills: { timeManagement: 2 }, physiological: { stress: 10 } }, logMessage: "Meeting initiated." },
  PUSH_FUNDING: { id: 'PUSH_FUNDING', label: 'Demand Funding', description: 'Force advisor to write a grant.', category: 'ACADEMICS', cost: { energy: 30, physiological: { stress: 20 } }, effect: { physiological: { sanity: -20 }, career: { supervisorRel: -5 } }, logMessage: "Nagged supervisor for money." },
  TAKE_LOAN: { id: 'TAKE_LOAN', label: 'Student Loan', description: 'Borrow money to survive.', category: 'LIFE', cost: { energy: 10, physiological: { stress: 20, sanity: -20 } }, effect: { funds: 5000 }, logMessage: "Took a predatory loan." },
  THERAPY: { id: 'THERAPY', label: 'Therapy', description: 'Professional help.', category: 'SELF_IMPROVEMENT', cost: { funds: 120 }, effect: { physiological: { sanity: 25, stress: -10 }, talents: { resilience: 5 } }, logMessage: "Therapy session." }
};
