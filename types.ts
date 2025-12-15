
export enum GamePhase {
  SETUP,
  MECHANICS_INTRO, // New phase for showing character details
  PLAYING,
  CONFIRMATION_REVIEW, 
  GAMEOVER_WIN,
  GAMEOVER_BURNOUT,
  GAMEOVER_BROKE,
  GAMEOVER_EXPELLED,
  GAMEOVER_RELATIONSHIP,
  GAMEOVER_INSANITY,
  GAMEOVER_HOSPITALIZED
}

export enum ResearchField {
  PHYSICS = "Physics, Chemistry & Materials (Multidisciplinary)",
}

export interface Paper {
  id: string;
  title: string;
  field: ResearchField;
  quality: number; // 0-100
  citations: number;
  accepted: boolean;
  publishedAtTurn?: number;
  journalName?: string; // New: which journal accepted it
  impactFactor?: number; // New: The correct IF
  citationFactor?: number; // New: Base weekly citation growth
}

export interface ResearchIdea {
  id: string;
  title: string;
  description: string;
  origin: string; // e.g. "From Reading", "From Seminar"

  // Game Mechanics / Stats (1-100)
  difficulty: number; // General difficulty
  potential: number;  // Impact factor

  // New Detailed Ratings (1-100)
  novelty: number;       // How unique is it?
  feasibility: number;   // How likely to succeed?
  resources: number;     // Resource Requirement (High = expensive/hard)
  attraction: number;    // How sexy is the topic?
}

export interface ActiveProject {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  failureCount: number; // New: Tracks number of setbacks
  
  // State
  status: 'RESEARCH' | 'REVISION'; // New: Current phase
  revisionRequirement?: number; // New: Target progress for revision
  targetJournal?: Journal; // New: The journal we are revising for

  // Inherited Stats
  difficulty: number; 
  potential: number; 
  novelty: number;
  feasibility: number;
  resources: number;
  attraction: number;
}

export interface JournalRequirement {
  novelty?: number;
  feasibility?: number;
  attraction?: number;
  resources?: number; // e.g. "Only high resource papers"
}

export interface Journal {
  id: string;
  name: string;
  description: string;
  impactFactor: number; // Replaces 'tier'. Real number (e.g. 0.5 to 50.0)
  
  // Acceptance Logic
  minimumQuality: number; // Below this = Desk Reject (0%)
  acceptQuality: number;  // Above this + Reqs Met = 100% Accept
  specificRequirements: JournalRequirement; // Specific stat thresholds

  // Rewards
  reputationReward: number;
  citationFactor: number; // Weekly citation gain base multiplier
  
  costToSubmit?: number; // For Open Access / Predatory
}

export interface MandatoryTask {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalEffort: number;
  deadline: number; // Week number
}

export interface LogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

// New Stats Structure
export interface PhysiologicalStats {
  health: number; // 0-100
  stress: number; // 0-100
  sanity: number; // 0-100
}

export interface TalentStats {
  creativity: number; // 1-100+
  focus: number;      // 1-100+
  logic: number;      // 1-100+
  resilience: number; // 1-100+
}

export interface SkillStats {
  timeManagement: number; // 1-100
  reading: number;        // 1-100
  writing: number;        // 1-100
  experiment: number;     // 1-100
  analysis: number;       // 1-100
  presentation: number;   // 1-100
}

export interface CareerStats {
  supervisorRel: number; // 0-100
  reputation: number;    // Accumulates
  // NEW: Meeting Mechanics
  meetingExpectation: number; // 0-100 (Pressure from supervisor)
  meetingPreparation: number; // 0-100 (Your readiness)
}

export interface PlayerStats {
  energy: number; // Top level resource
  funds: number;  // Top level resource
  
  physiological: PhysiologicalStats;
  talents: TalentStats;
  skills: SkillStats;
  career: CareerStats;
}

// recursive partial to allow updating nested stats in effects
export interface ActionEffect {
  energy?: number;
  funds?: number;
  physiological?: Partial<PhysiologicalStats>;
  talents?: Partial<TalentStats>;
  skills?: Partial<SkillStats>;
  career?: Partial<CareerStats>;
}

export interface WeeklyModifier {
  description: string;
  stats: Partial<PlayerStats>; 
  effect: ActionEffect;
}

// Hidden Stats for Compatibility Calculation
export interface PersonalityProfile {
  // 0 = Rigid/Structured, 100 = Chaotic/Flexible
  workStyle: number; 
  // 0 = Pragmatic/Prestige/Money, 100 = Passion/Curiosity/Idealism
  motivation: number; 
}

export type ActionCategory = 'LIFE' | 'ACADEMICS' | 'SOCIAL' | 'SELF_IMPROVEMENT' | 'SPECIAL';

export interface GameAction {
  id: string;
  label: string;
  description: string;
  category: ActionCategory;
  cost: {
    energy?: number;
    funds?: number;
    stress?: number; 
    physiological?: Partial<PhysiologicalStats>;
  };
  effect: ActionEffect;
  logMessage: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  education: string;
  description: string;
  imageColor: string;
  personality: PersonalityProfile; // New hidden stat
  initialModifiers: Partial<PlayerStats>;
  initialDebt?: number; // New: Starts with specific debt
  weeklyModifier: WeeklyModifier;
  // New Mechanics
  maxStatModifiers?: Partial<PlayerStats>; // Modifiers to the stat caps
  exclusiveActions?: GameAction[]; // Actions available only to this background
}

export interface SupervisorProfile {
  id: string;
  name: string;
  title: string;
  institution: string;
  imageColor: string;
  stats: {
    citations: number;
    hIndex: number;
    i10Index: number;
  };
  reputation: number; // 0-100, influences acceptance rates
  initialFunding: number; // Lab funding pool
  personality: PersonalityProfile; // New hidden stat
  description: string;
  initialModifiers: Partial<PlayerStats>;
  weeklyModifier: WeeklyModifier;
  // New Mechanics
  maxStatModifiers?: Partial<PlayerStats>; 
  exclusiveActions?: GameAction[];
  
  // NEW: Meeting Configuration
  meetingConfig: {
    expectationGrowth: number; // How fast expectation grows per week
    expectationCap: number;    // Max expectation before forced meeting (usually 100)
    preparationCap: number;    // Max prep (usually 100)
    patience: number;          // Modifier for penalties
  };
}

// Dynamic state for the supervisor during gameplay
export interface SupervisorState {
    funding: number; // Lab Grant Money
    reputation: number; // Dynamic reputation
    grantProgress: number | null; // 0-100 if applying for grant, null otherwise
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: 'good' | 'bad' | 'neutral';
  effect: ActionEffect;
  // Special system effects that don't fit in ActionEffect
  specialEffect?: {
    rentChange?: number; // Add/Sub from weekly rent
    mandatoryProgress?: number; // Add/Sub from mandatory task
    labFundingChange?: number; // New: Add/Sub from supervisor funding
  };
  weight: number; // 1 (rare) to 10 (common)
}

// New Types for Submission Logic
export type ReviewType = 'MINOR_REVISION' | 'MAJOR_REVISION' | 'RESUBMIT';

export interface SubmissionRewards {
  reputation: number;
  relationship: number;
  stressRef: number; // Reduction
  sanity: number;
  pressureRef: number; // Meeting pressure reduction
}

export interface SubmissionResult {
  status: 'ACCEPTED' | 'REJECTED' | 'PEER_REVIEW' | 'DESK_REJECT';
  journal: Journal;
  reviewType?: ReviewType; // Only if PEER_REVIEW
  message: string; // The reviewer comment
  rewards?: SubmissionRewards; // Only if ACCEPTED
}

export interface GameState {
  turn: number; // Weeks
  phase: GamePhase;
  field: ResearchField;
  supervisorId?: string;
  supervisorState?: SupervisorState; // New: Dynamic Supervisor Stats
  backgroundId?: string;
  stats: PlayerStats;
  maxStats: PlayerStats; // Dynamic Max Stats based on background
  currentRent: number; // Rent can change via events
  mandatoryTask: MandatoryTask | null;
  playerDebt: number; // Track active loan amount
  loanDeadline: number | null; // New: When the loan is due
  
  // Research System
  activeProject: ActiveProject | null;
  availableIdeas: ResearchIdea[]; // Collected ideas waiting to be started

  publishedPapers: Paper[];
  logs: LogEntry[];
  loading: boolean;
}
