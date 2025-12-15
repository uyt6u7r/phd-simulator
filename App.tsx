
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, ResearchField, LogEntry, ActiveProject, Paper, GameAction, PlayerStats, SupervisorProfile, BackgroundOption, PhysiologicalStats, RandomEvent, ResearchIdea, Journal, SubmissionResult, ReviewType } from './types';
import { INITIAL_GAME_STATE, COST, MAX_STATS, WIN_CONDITION_REPUTATION, WIN_CONDITION_PAPERS, BACKGROUND_POOL, SUPERVISOR_POOL, CONFIRMATION_TASK, YEAR_2_REVIEW_TASK, WEEKLY_LAB_COST } from './constants';
import { generateResearchTopic, generatePeerReview, generateRandomEvent } from './services/geminiService';
import { RANDOM_EVENT_POOL } from './events';
import { JOURNALS } from './journals'; // Import central journal list
import { StatsBar } from './components/StatsBar';
import { ProjectCard } from './components/ProjectCard';
import { MandatoryTaskCard } from './components/MandatoryTaskCard';
import { ConfirmationModal } from './components/ConfirmationModal';
import { MechanicsIntroModal } from './components/MechanicsIntroModal';
import { RandomEventModal } from './components/RandomEventModal';
import { IdeaDetailModal } from './components/IdeaDetailModal';
import { ResearchCompleteModal } from './components/ResearchCompleteModal';
import { SubmissionResultModal } from './components/SubmissionResultModal';
import { LogPanel } from './components/LogPanel';
import { ActionsPanel } from './components/ActionsPanel';
import { AdvisorStatusPanel } from './components/AdvisorStatusPanel';
import { PapersList } from './components/PapersList';
import { 
  GraduationCap, RotateCcw, Award, Frown, CalendarClock, ArrowRight, 
  User, UserCheck, Quote, Shuffle, DoorOpen, Wallet, TrendingUp, 
  HeartCrack, UserX, Brain, Zap, Activity, Smile, Heart, Sparkles, 
  BookOpen, Star, Banknote 
} from 'lucide-react';

// --- UI HELPERS FOR SUPERVISOR SELECTION ---
const getFundingDesc = (funding: number) => {
    if (funding < 50000) return "Tight Budget";
    if (funding < 100000) return "Stable";
    if (funding < 250000) return "Well-Funded";
    if (funding < 500000) return "Wealthy";
    return "Empire";
};

const getReputationDesc = (rep: number) => {
    if (rep < 30) return "Unknown";
    if (rep < 50) return "Rising Star";
    if (rep < 70) return "Respected";
    if (rep < 90) return "Distinguished";
    return "Legendary";
};

// --- LOGIC HELPERS ---

// Calculate energy recovery based on physiological stats
// Pure function: Calculates recovery based on the EXACT stats provided (Post-Decay)
const calculateEnergyRecovery = (stats: PlayerStats, maxStats: PlayerStats) => {
    // Current Stats (Should already include weekly decay if called from nextWeek, or simulated decay if called from UI)
    const health = stats.physiological.health;
    const sanity = stats.physiological.sanity;
    const stress = stats.physiological.stress;

    const healthRatio = health / maxStats.physiological.health;
    const sanityRatio = sanity / maxStats.physiological.sanity;
    const stressRatio = stress / maxStats.physiological.stress;

    // Base: 50% of Max Energy
    let recoveryPct = 0.50;

    // Modifiers
    // Health: Center at 70%. +/- 0.5 weight.
    recoveryPct += (healthRatio - 0.7) * 0.5;
    
    // Sanity: Center at 70%. +/- 0.5 weight.
    recoveryPct += (sanityRatio - 0.7) * 0.5;

    // Stress: Center at 30%. +/- 0.6 weight.
    // Low stress boosts recovery. High stress tanks it.
    recoveryPct += (0.3 - stressRatio) * 0.6;

    // Clamp Recovery % (Min 5%, Max 100%)
    recoveryPct = Math.max(0.05, Math.min(1.0, recoveryPct));

    return Math.round(maxStats.energy * recoveryPct);
};

// ---------------------------------------------

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  
  // Setup State
  const [setupStep, setSetupStep] = useState(1);
  const [offeredBackgrounds, setOfferedBackgrounds] = useState<BackgroundOption[]>([]);
  const [offeredSupervisors, setOfferedSuperors] = useState<SupervisorProfile[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorProfile | null>(null);
  
  // Research State
  const [selectedIdea, setSelectedIdea] = useState<ResearchIdea | null>(null);
  const [researchCompleteData, setResearchCompleteData] = useState<{ quality: number, journals: Journal[] } | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Extra actions derived from bg + supervisor
  const [combinedExtraActions, setCombinedExtraActions] = useState<GameAction[]>([]);
  
  // Pending Event State
  const [pendingRandomEvent, setPendingRandomEvent] = useState<RandomEvent | null>(null);

  // Initialize random options
  useEffect(() => {
    shuffleOptions();
  }, []);

  const shuffleOptions = () => {
    const bg = [...BACKGROUND_POOL].sort(() => 0.5 - Math.random());
    setOfferedBackgrounds(bg.slice(0, 3));
    
    const sup = [...SUPERVISOR_POOL].sort(() => 0.5 - Math.random());
    setOfferedSuperors(sup.slice(0, 3));
  };

  // Helper to add logs
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, {
        id: Date.now().toString() + Math.random(),
        turn: prev.turn,
        message,
        type
      }]
    }));
  };

  // Helper to check game over conditions
  const checkGameOver = useCallback((currentStats: PlayerStats, papers: Paper[], maxStats: PlayerStats) => {
    // Loss conditions
    if (currentStats.physiological.stress >= maxStats.physiological.stress) return GamePhase.GAMEOVER_BURNOUT;
    if (currentStats.funds <= -1000) return GamePhase.GAMEOVER_BROKE; 
    
    // Failure Conditions
    if (currentStats.career.supervisorRel <= 0) return GamePhase.GAMEOVER_RELATIONSHIP;
    if (currentStats.physiological.sanity <= 0) return GamePhase.GAMEOVER_INSANITY;
    if (currentStats.physiological.health <= 0) return GamePhase.GAMEOVER_HOSPITALIZED;

    // Win conditions
    const acceptedPapers = papers.filter(p => p.accepted).length;
    if (acceptedPapers >= WIN_CONDITION_PAPERS && currentStats.career.reputation >= WIN_CONDITION_REPUTATION) {
      return GamePhase.GAMEOVER_WIN;
    }

    return GamePhase.PLAYING;
  }, []);

  // Helper to update categories recursively with dynamic clamping
  const updateStatsCategories = (currentStats: PlayerStats, data: any, maxStats: PlayerStats) => {
        if (!data) return;
        const update = (category: keyof PlayerStats, modifier: any) => {
            if (!modifier) return;
            const target = currentStats[category] as any;
            const maxCategory = maxStats[category] as any;

            Object.entries(modifier).forEach(([key, val]) => {
                const numVal = val as number;
                if (target[key] !== undefined) {
                    target[key] = Math.max(0, target[key] + numVal);
                    // Clamp if max exists for this specific field
                    if (maxCategory && maxCategory[key]) {
                        target[key] = Math.min(maxCategory[key], target[key]);
                    }
                }
            });
        };

        if (data.energy) currentStats.energy = Math.min(maxStats.energy, currentStats.energy + data.energy);
        if (data.funds) currentStats.funds += data.funds;
        
        update('physiological', data.physiological);
        update('talents', data.talents);
        update('skills', data.skills);
        update('career', data.career);
  };

  // Handler for advancing to the next week
  const handleNextWeek = async () => {
    // 1. DETERMINE EVENT TYPE (Forced vs Random)
    // We do this BEFORE setGameState so we can trigger the popup correctly
    let selectedEvent: RandomEvent | null = null;
    let isForcedMeeting = false;
    let isFundingCrisis = false;
    let isScandal = false;

    // Check Forced Meeting Conditions First
    if (gameState.supervisorId) {
        const supervisor = SUPERVISOR_POOL.find(s => s.id === gameState.supervisorId);
        if (supervisor) {
             const pressure = supervisor.meetingConfig?.expectationGrowth || 5;
             const maxExpectation = gameState.maxStats.career.meetingExpectation || 100;
             // Calculate predicted value to see if it hits the cap
             const predictedExpectation = gameState.stats.career.meetingExpectation + pressure;

             if (predictedExpectation >= maxExpectation) {
                 isForcedMeeting = true;
                 selectedEvent = {
                     id: 'FORCED_MEETING_' + gameState.turn,
                     title: 'FORCED MEETING',
                     description: `${supervisor.name} has lost patience and demanded a progress update immediately. You were unprepared.`,
                     type: 'bad',
                     weight: 0,
                     effect: {
                         physiological: { stress: 25 },
                         career: { supervisorRel: -15 }
                     }
                 };
             }
        }
    }

    // Check Funding Crisis (Popup Trigger)
    if (!isForcedMeeting && gameState.supervisorState && gameState.supervisorState.funding <= 0) {
        // Trigger popup for funding crisis
        isFundingCrisis = true;
        selectedEvent = {
            id: 'FUNDING_CRISIS_' + gameState.turn,
            title: 'FUNDING CRISIS',
            description: 'Lab funding has run out! Research halted. Stress increasing. Push your supervisor for funding immediately!',
            type: 'bad',
            weight: 0,
            effect: {
                 physiological: { stress: 10, sanity: -10 },
                 career: { supervisorRel: -5 }
            }
        };
    }

    // SPECIAL: DR. VANE SCANDAL CHECK
    if (!isForcedMeeting && !isFundingCrisis && gameState.supervisorId === 'VANE') {
        if (Math.random() < 0.025) { // 2.5% chance per week
            isScandal = true;
            selectedEvent = {
                id: 'SCANDAL_' + gameState.turn,
                title: 'ACADEMIC SCANDAL!',
                description: 'Dr. Vane\'s misconduct has been exposed! Lab accounts frozen. Reputation destroyed.',
                type: 'bad',
                weight: 0,
                effect: {
                    physiological: { stress: 50, sanity: -50 },
                    career: { reputation: -50 }
                    // Lab funding zeroing handled below
                }
            };
        }
    }

    // If no forced meeting and no crisis popup logic and no scandal, roll for random event (30% chance)
    if (!isForcedMeeting && !isFundingCrisis && !isScandal && Math.random() < 0.30) {
        const totalWeight = RANDOM_EVENT_POOL.reduce((sum, e) => sum + e.weight, 0);
        let randomWeight = Math.random() * totalWeight;
        selectedEvent = RANDOM_EVENT_POOL.find(e => {
            randomWeight -= e.weight;
            return randomWeight <= 0;
        }) || RANDOM_EVENT_POOL[0];
    }

    setGameState(prev => {
        let newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;
        const maxStats = prev.maxStats;
        let mandatoryTask = prev.mandatoryTask ? {...prev.mandatoryTask} : null;
        let currentPhase = prev.phase;
        let newCurrentRent = prev.currentRent;
        let logsToAdd: LogEntry[] = [];
        let updatedPapers = [...prev.publishedPapers];
        let newSupervisorState = prev.supervisorState ? { ...prev.supervisorState } : undefined;
        let newPlayerDebt = prev.playerDebt;

        // --- CHECK MANDATORY TASK DEADLINE ---
        if (mandatoryTask?.id === 'CONFIRMATION' && prev.turn >= mandatoryTask.deadline) {
            return {
                ...prev,
                phase: GamePhase.CONFIRMATION_REVIEW
            };
        }
        
        // --- NORMAL TURN LOGIC ---

        // 0. Update Paper Citations
        updatedPapers = updatedPapers.map(p => {
            if (p.accepted && p.citationFactor) {
                // Formula: Factor + (Quality/20) + Random(0-2)
                const growth = p.citationFactor + (p.quality / 20) + (Math.random() * 2);
                return { ...p, citations: p.citations + Math.floor(growth) };
            }
            return p;
        });
        
        // 1. Passive Stats Changes
        newStats.funds -= prev.currentRent; // Use Dynamic Rent
        newStats.physiological.stress = Math.max(0, newStats.physiological.stress - 5);
        newStats.physiological.sanity = Math.max(0, newStats.physiological.sanity - 2); // Natural decay
        newStats.physiological.health = Math.max(0, newStats.physiological.health - 1); // Aging/Sedentary lifestyle

        // 1a. DEBT PENALTY & INTEREST (New)
        if (prev.playerDebt > 0) {
            // Apply Interest (1% weekly)
            const interest = Math.ceil(prev.playerDebt * 0.01);
            newPlayerDebt += interest;

            // Check Deadline
            if (prev.loanDeadline && prev.turn > prev.loanDeadline) {
                // OVERDUE
                newStats.physiological.stress += 20;
                newStats.career.reputation -= 5;
                newStats.physiological.sanity -= 5;
                logsToAdd.push({
                    id: Date.now().toString() + 'overdue',
                    turn: prev.turn,
                    message: "LOAN OVERDUE! Collections agents are calling your lab. Reputation -5, Stress +20.",
                    type: 'danger'
                });
            } else {
                // Normal Debt Anxiety
                newStats.physiological.stress += 2;
                newStats.physiological.sanity -= 1;
                logsToAdd.push({
                    id: Date.now().toString() + 'debt',
                    turn: prev.turn,
                    message: `Loan interest accrued ($${interest}). Debt: $${newPlayerDebt}.`,
                    type: 'warning'
                });
            }
        }

        // 1b. Lab Funding Decay & Cost Calculation
        let labCost = 0;
        if (newSupervisorState) {
            // New Formula: Base (2000) + RepModifier + Random(+/- 20%)
            // Rep Modifier = 0.25 * rep^2 + 25 * rep
            const rep = newSupervisorState.reputation;
            const repMod = (0.25 * Math.pow(rep, 2)) + (25 * rep);
            
            const baseCost = WEEKLY_LAB_COST + repMod;
            
            // Fluctuation: 0.8 to 1.2
            const fluctuation = 0.8 + (Math.random() * 0.4);
            
            labCost = Math.floor(baseCost * fluctuation);
            
            newSupervisorState.funding = Math.max(0, newSupervisorState.funding - labCost);

            // SPECIAL WEEKLY FUNDING FOR KENSINGTON
            if (prev.supervisorId === 'KENSINGTON') {
                newSupervisorState.funding += 2000;
            }

            // SPECIAL WEEKLY EMBEZZLEMENT FOR VANE
            if (prev.supervisorId === 'VANE') {
                if (newSupervisorState.funding >= 2000) {
                     newSupervisorState.funding -= 2000;
                     newStats.funds += 1000;
                     logsToAdd.push({
                        id: Date.now().toString() + 'vane',
                        turn: prev.turn,
                        message: "Dr. Vane 'reallocated' some lab funds. You received $1000 hush money.",
                        type: 'warning'
                     });
                }
            }

            // Funding Crisis Passive Effects (Happen every week funding is 0)
            if (newSupervisorState.funding <= 0) {
                newStats.physiological.stress += 10;
                newStats.physiological.sanity -= 10;
                newStats.career.supervisorRel = Math.max(0, newStats.career.supervisorRel - 5);
                // Note: We add a log here, even if popup triggers
                logsToAdd.push({
                    id: Date.now().toString() + 'broke',
                    turn: prev.turn,
                    message: "Lab is bankrupt! Research halted. Stress ++.",
                    type: 'danger'
                });
            }

            // GRANT APPLICATION PROGRESS
            if (newSupervisorState.grantProgress !== null) {
                newSupervisorState.grantProgress += 20;
                if (newSupervisorState.grantProgress >= 100) {
                    // Grant Logic
                    const score = (newSupervisorState.reputation * 0.7) + (Math.random() * 100);
                    let grantAmount = 0;
                    let grantTier = "";
                    let logType: LogEntry['type'] = 'info';

                    if (score < 40) {
                        grantAmount = 0;
                        grantTier = "REJECTED";
                        logType = 'danger';
                        newStats.physiological.stress += 15;
                    } else if (score < 90) {
                        grantAmount = 5000;
                        grantTier = "Small Grant";
                        logType = 'success';
                    } else if (score < 140) {
                        grantAmount = 25000;
                        grantTier = "Moderate Grant";
                        logType = 'success';
                    } else {
                        grantAmount = 100000;
                        grantTier = "HUGE Grant";
                        logType = 'success';
                    }

                    newSupervisorState.funding += grantAmount;
                    newSupervisorState.grantProgress = null; // Reset

                    logsToAdd.push({
                        id: Date.now().toString() + 'grant',
                        turn: prev.turn,
                        message: `Grant Decision: ${grantTier} ${grantAmount > 0 ? `($${grantAmount})` : ''} awarded!`,
                        type: logType
                    });
                }
            }
        }

        // 2. Supervisor Weekly Effect & Meeting Mechanics
        if (prev.supervisorId) {
            const supervisor = SUPERVISOR_POOL.find(s => s.id === prev.supervisorId);
            if (supervisor) {
                 // Weekly Effect
                 if(supervisor.weeklyModifier && supervisor.weeklyModifier.effect) {
                     updateStatsCategories(newStats, supervisor.weeklyModifier.effect, maxStats);
                 }
                 
                 // SPECIAL: Amber Wang Random Relationship
                 if (prev.supervisorId === 'AMBER') {
                     const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
                     const currentRel = newStats.career.supervisorRel;
                     const maxRel = maxStats.career.supervisorRel || 100;
                     const newRel = Math.max(0, Math.min(maxRel, currentRel + change));
                     
                     newStats.career.supervisorRel = newRel;

                     // Don't log spam every week unless significant
                     if (Math.abs(change) >= 5) {
                         logsToAdd.push({
                             id: Date.now().toString() + 'amber',
                             turn: prev.turn,
                             message: `Amber's mood swing: Rel ${change > 0 ? '+' : ''}${change}`,
                             type: 'warning'
                         });
                     }
                 }

                 if (isForcedMeeting) {
                     // FORCED MEETING LOGIC
                     newStats.physiological.stress += 25;
                     newStats.career.supervisorRel = Math.max(0, newStats.career.supervisorRel - 15);
                     
                     // CRITICAL: Reset Expectation AND Preparation
                     newStats.career.meetingExpectation = 0;
                     newStats.career.meetingPreparation = 0;
                     
                     logsToAdd.push({
                         id: Date.now().toString() + 'force',
                         turn: prev.turn,
                         message: `Forced Meeting with ${supervisor.name}. Stress +25, Rel -15. Prep reset.`,
                         type: 'danger'
                     });
                 } else {
                     // Standard Accumulation
                     const pressure = supervisor.meetingConfig?.expectationGrowth || 5;
                     const maxExpectation = maxStats.career.meetingExpectation || 100;
                     newStats.career.meetingExpectation = Math.min(maxExpectation, newStats.career.meetingExpectation + pressure);
                 }
            }
        }

        // 3. Background Weekly Effect
        if (prev.backgroundId) {
            const background = BACKGROUND_POOL.find(b => b.id === prev.backgroundId);
            if (background && background.weeklyModifier && background.weeklyModifier.effect) {
                updateStatsCategories(newStats, background.weeklyModifier.effect, maxStats);
            }
        }

        // 4. Calculate Energy Recovery
        // We pass the ALREADY decayed stats (newStats) to calculate recovery.
        // This ensures the calculation logic matches exactly what we predict in the UI (where we simulated decay).
        const energyRecovery = calculateEnergyRecovery(newStats, maxStats);

        newStats.energy = Math.min(maxStats.energy, newStats.energy + energyRecovery);

        // --- APPLY EVENT EFFECTS (If NOT forced meeting) ---
        let randomEventLog = null;
        if (selectedEvent && !isForcedMeeting) {
            // Apply Effects
            updateStatsCategories(newStats, selectedEvent.effect, maxStats);
            
            if (selectedEvent.specialEffect) {
                if (selectedEvent.specialEffect.rentChange) {
                    newCurrentRent += selectedEvent.specialEffect.rentChange;
                }
                if (selectedEvent.specialEffect.mandatoryProgress && mandatoryTask) {
                    mandatoryTask.progress += selectedEvent.specialEffect.mandatoryProgress;
                }
                if (selectedEvent.specialEffect.labFundingChange && newSupervisorState) {
                    newSupervisorState.funding += selectedEvent.specialEffect.labFundingChange;
                }
            }

            // VANE SCANDAL SPECIAL
            if (selectedEvent.id.startsWith('SCANDAL') && newSupervisorState) {
                newSupervisorState.funding = 0;
            }

            const logType = selectedEvent.type === 'good' ? 'success' : selectedEvent.type === 'bad' ? 'danger' : 'warning';
            randomEventLog = {
                    id: Date.now().toString() + 'event',
                    turn: prev.turn,
                    message: `EVENT: ${selectedEvent.title}`, 
                    type: logType as any
            };
        }

        if (currentPhase === GamePhase.PLAYING) {
             currentPhase = checkGameOver(newStats, updatedPapers, maxStats);
        }

        const recoveryMsg = `Week ${prev.turn} ended. Paid Rent. Recovered ${energyRecovery} Energy.`;
        
        let newLogs = [...prev.logs, {
                id: Date.now().toString(),
                turn: prev.turn,
                message: recoveryMsg,
                type: 'info' as const
        }];

        if (prev.supervisorId) {
             const sv = SUPERVISOR_POOL.find(s => s.id === prev.supervisorId);
             if (sv) newLogs.push({id: Date.now().toString()+'sv', turn: prev.turn, message: sv.weeklyModifier.description, type: 'warning'});
        }
        if (prev.backgroundId) {
            const bg = BACKGROUND_POOL.find(b => b.id === prev.backgroundId);
            if (bg) newLogs.push({id: Date.now().toString()+'bg', turn: prev.turn, message: bg.weeklyModifier.description, type: 'warning'});
        }

        newLogs = [...newLogs, ...logsToAdd];

        if (randomEventLog) {
            newLogs.push(randomEventLog);
        }

        return {
            ...prev,
            stats: newStats,
            supervisorState: newSupervisorState,
            turn: prev.turn + 1,
            phase: currentPhase,
            mandatoryTask,
            currentRent: newCurrentRent,
            publishedPapers: updatedPapers,
            playerDebt: newPlayerDebt, // Store with interest
            logs: newLogs
        };
    });

    if (selectedEvent) {
        setPendingRandomEvent(selectedEvent);
    }

    if (gameState.phase === GamePhase.PLAYING && Math.random() > 0.95 && !isForcedMeeting && !isFundingCrisis && !isScandal) {
        const eventText = await generateRandomEvent(gameState.stats.physiological); 
        addLog(eventText, 'warning');
    }
  };

  const handleConfirmationOutcome = (success: boolean) => {
      setGameState(prev => {
          let newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;
          let newLogs = [...prev.logs];
          let nextPhase = prev.phase;
          let mandatoryTask = prev.mandatoryTask;

          if (success) {
            newStats.career.reputation += 30;
            newStats.physiological.stress = Math.max(0, newStats.physiological.stress - 20);
            
            newLogs.push({
                id: Date.now().toString() + 'pass',
                turn: prev.turn,
                message: `CONFIRMATION PASSED! The committee was impressed. You are now a PhD Candidate.`,
                type: 'success'
            });

            mandatoryTask = JSON.parse(JSON.stringify(YEAR_2_REVIEW_TASK));
            nextPhase = GamePhase.PLAYING;
          } else {
             newLogs.push({
                id: Date.now().toString() + 'fail',
                turn: prev.turn,
                message: `CONFIRMATION FAILED. You did not meet the requirements.`,
                type: 'danger'
            });
            nextPhase = GamePhase.GAMEOVER_EXPELLED;
          }

          return {
              ...prev,
              stats: newStats,
              mandatoryTask,
              phase: nextPhase,
              logs: newLogs
          };
      });
  };

  const generateIdea = async (origin: string) => {
      setGameState(prev => ({ ...prev, loading: true }));
      try {
          // 1. Build context string
          const stats = gameState.stats;
          const highStats = [];
          if (stats.talents.creativity > 70) highStats.push("highly creative");
          if (stats.talents.focus > 70) highStats.push("highly focused");
          if (stats.talents.logic > 70) highStats.push("very logical");
          
          const context = highStats.length > 0 ? `Student is ${highStats.join(' and ')}.` : "";

          // 2. Call Gemini for flavor (Title, Description)
          const topic = await generateResearchTopic(gameState.field, context);

          // 3. Calculate Stats Locally using "Max Cap" logic
          const clamp = (val: number) => Math.max(1, Math.min(100, Math.floor(val)));
          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          // Novelty based on Creativity
          const maxNovelty = 25 + (stats.talents.creativity * 0.75);
          const novelty = clamp(randomInRange(Math.max(1, maxNovelty - 20), maxNovelty));

          // Feasibility based on Focus
          const maxFeasibility = 30 + (stats.talents.focus * 0.6);
          const feasibility = clamp(randomInRange(Math.max(1, maxFeasibility - 20), maxFeasibility));

          // Potential based on Logic AND Supervisor Reputation (New)
          const supRepBonus = gameState.supervisorState ? gameState.supervisorState.reputation * 0.1 : 0;
          const maxPotential = 20 + (stats.talents.logic * 0.8) + supRepBonus;
          const potential = clamp(randomInRange(Math.max(1, maxPotential - 25), maxPotential));

          // Attraction based on Presentation + Random
          const maxAttraction = 10 + (stats.skills.presentation * 0.5) + 40; // 40 is base random pot
          const attraction = clamp(randomInRange(Math.max(1, maxAttraction - 20), maxAttraction));

          // Resources (Random)
          const resources = clamp(randomInRange(10, 90));

          // Difficulty (Derived)
          // High Novelty or High Resources increases difficulty. High Feasibility lowers it.
          const difficultyRaw = (novelty * 0.4) + (resources * 0.3) + ((100 - feasibility) * 0.3);
          const difficulty = clamp(difficultyRaw);

          const newIdea: ResearchIdea = {
              id: Date.now().toString(),
              title: topic.title,
              description: topic.description,
              origin: origin,
              difficulty,
              potential,
              novelty,
              feasibility,
              resources,
              attraction
          };

          setGameState(prev => ({
              ...prev,
              availableIdeas: [...prev.availableIdeas, newIdea],
              loading: false
          }));
          addLog(`Spark of Inspiration! "${newIdea.title}" added to notebook.`, 'success');
      } catch (e) {
          setGameState(prev => ({ ...prev, loading: false }));
      }
  };

  const handleAction = async (action: GameAction) => {
    if (action.id === 'MEET_SUPERVISOR') {
        const supervisor = SUPERVISOR_POOL.find(s => s.id === gameState.supervisorId);
        if (supervisor) {
            const currentPrep = gameState.stats.career.meetingPreparation;
            const requiredPrep = supervisor.meetingConfig?.preparationCap || 100;
            if (currentPrep < requiredPrep * 0.9) {
                addLog(`You are not prepared for this meeting! (Prep: ${Math.round(currentPrep)}/${requiredPrep})`, 'danger');
                return;
            }
        }
    }

    // SPECIAL: BUY_RESULTS (Kensington)
    if (action.id === 'BUY_RESULTS') {
        if (!gameState.activeProject) {
            addLog("No active project to buy results for.", 'warning');
            return;
        }
        if (!gameState.supervisorState || gameState.supervisorState.funding < 5000) {
            addLog("Not enough lab funding ($5000 required).", 'danger');
            return;
        }
    }

    // SPECIAL: DATA_MANIPULATION (Vane)
    if (action.id === 'DATA_MANIPULATION') {
        if (!gameState.activeProject) {
            addLog("No active project to manipulate.", 'warning');
            return;
        }
    }

    setGameState(prev => {
        let { cost, effect } = action;
        const newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;
        let newSupervisorState = prev.supervisorState ? { ...prev.supervisorState } : undefined;
        let newPlayerDebt = prev.playerDebt;
        let newLoanDeadline = prev.loanDeadline;

        // --- DYNAMIC COSTS ---
        
        // PUSH_FUNDING
        if (action.id === 'PUSH_FUNDING') {
             const presentation = prev.stats.skills.presentation;
             
             // KENSINGTON OVERRIDE
             if (prev.supervisorId === 'KENSINGTON') {
                 // Halved energy cost
                 cost = { ...cost, energy: (cost.energy || 30) / 2 };
                 // Effect override: Relationship GAIN
                 effect = { ...effect, career: { supervisorRel: 5 } };
                 // Kensington doesn't have the <5 rel requirement
             } else {
                 // Standard logic
                 const reduction = Math.floor(presentation / 5);
                 const baseStress = 20;
                 const baseSanityCost = 20; 
                 const actualStress = Math.max(5, baseStress - reduction);
                 const actualSanityCost = Math.max(5, baseSanityCost - reduction);

                 cost = { ...cost, physiological: { stress: actualStress } };
                 effect = { 
                     ...effect, 
                     physiological: { 
                         ...effect.physiological, 
                         sanity: -actualSanityCost 
                     } 
                 };
             }
        }

        // TAKE_LOAN (Borrow vs Repay)
        if (action.id === 'TAKE_LOAN') {
            if (prev.playerDebt > 0) {
                // REPAY LOGIC
                // Cost becomes funds equal to debt + Energy (from base cost)
                cost = { funds: prev.playerDebt, energy: 10 }; 
                // Effect clears debt and reduces stress and heals sanity
                newPlayerDebt = 0;
                newLoanDeadline = null;
                effect = { physiological: { stress: -15, sanity: 15 } }; // Updated Benefit
            } else {
                // BORROW LOGIC
                // Effect adds funds
                effect = { funds: 5000, physiological: { sanity: -20 } }; // Updated Cost
                newPlayerDebt = 5000;
                // Add Deadline (20 weeks)
                newLoanDeadline = prev.turn + 20;
                // Cost is energy (base) + Stress (Penalty for taking loan)
                cost = { energy: 10, physiological: { stress: 20 } } as any; 
            }
        }
        
        // CRISIS_MEETING (Amber Wang)
        if (action.id === 'CRISIS_MEETING') {
             const resilience = prev.stats.talents.resilience;
             const presentation = prev.stats.skills.presentation;
             // Cost reduction
             const reduction = Math.floor((resilience + presentation) / 10);
             const baseEn = 20;
             const actualEn = Math.max(5, baseEn - reduction);
             cost = { ...cost, energy: actualEn };
        }

        // DATA_MANIPULATION (Vane)
        if (action.id === 'DATA_MANIPULATION') {
            const creativity = prev.stats.talents.creativity;
            const logic = prev.stats.talents.logic;
            // High creativity = easier to fake data
            const reduction = Math.floor((creativity + logic) / 10); 
            const baseEn = 20;
            const actualEn = Math.max(5, baseEn - reduction);
            cost = { ...cost, energy: actualEn };
        }

        // BUY_RESULTS (Kensington)
        if (action.id === 'BUY_RESULTS' && newSupervisorState && prev.activeProject) {
            newSupervisorState.funding -= 5000;
        }

        // ------------------------------------------
        
        if (cost.energy && prev.stats.energy < cost.energy) return prev;
        if (cost.funds && prev.stats.funds < cost.funds) return prev;
        
        if (cost.energy) newStats.energy -= cost.energy;
        if (cost.funds) newStats.funds -= cost.funds;
        if (cost.stress) newStats.physiological.stress += cost.stress; 
        
        if (cost.physiological?.stress) {
            newStats.physiological.stress += cost.physiological.stress;
        }

        updateStatsCategories(newStats, effect, prev.maxStats);

        if (action.id === 'MEET_SUPERVISOR') {
             newStats.career.meetingExpectation = 0;
             newStats.career.meetingPreparation = 0;
             newStats.career.supervisorRel += 10; 
        }

        if (action.id === 'PUSH_FUNDING' && newSupervisorState) {
            // Initiate Grant Application Process for everyone, including Kensington
            newSupervisorState.grantProgress = 0;
        }
        
        // Project Progress handled below (BUY_RESULTS, DATA_MANIPULATION)

        return {
            ...prev,
            stats: newStats,
            supervisorState: newSupervisorState,
            playerDebt: newPlayerDebt,
            loanDeadline: newLoanDeadline
        };
    });
    
    // SECOND STATE UPDATE FOR COMPLEX LOGIC (Project Progress, Ideas)
    
    if (action.id === 'PUSH_FUNDING') {
        if (gameState.supervisorId === 'KENSINGTON') {
             addLog("Kensington nodded approvingly. 'Good initiative.' Grant application started.", 'success');
        } else {
             addLog("Submitted a grant application. This will take time (5 Weeks).", 'info');
        }
    } else if (action.id === 'TAKE_LOAN') {
        if (gameState.playerDebt > 0) {
            addLog("Loan repaid in full! The weight is lifted.", 'success');
        } else {
            addLog("Took a $5000 loan. 1% Interest weekly. Due in 20 weeks.", 'warning');
        }
    } else {
        addLog(action.logMessage, action.category === 'ACADEMICS' ? 'info' : 'success');
    }
    
    // PROGRESS LOGIC
    if (action.id === 'BUY_RESULTS') {
        setGameState(prev => {
            if(!prev.activeProject) return prev;
            const target = prev.activeProject.status === 'REVISION' ? (prev.activeProject.revisionRequirement || 100) : 100;
            const newProgress = Math.min(target, prev.activeProject.progress + 15);
            return {
                ...prev,
                activeProject: { ...prev.activeProject, progress: newProgress }
            }
        });
        addLog("Data bought. Progress +15%. Advisor relationship took a hit.", 'warning');
    }

    if (action.id === 'DATA_MANIPULATION') {
        setGameState(prev => {
            if(!prev.activeProject) return prev;
            const target = prev.activeProject.status === 'REVISION' ? (prev.activeProject.revisionRequirement || 100) : 100;
            const newProgress = Math.min(target, prev.activeProject.progress + 10);
            return {
                ...prev,
                activeProject: { ...prev.activeProject, progress: newProgress }
            }
        });
        addLog("Fabricated results integrated. Progress +10%. You feel your soul withering.", 'danger');
    }

    const IDEA_TRIGGERS: Record<string, number> = {
        'READ_PAPERS': 0.35,
        'ATTEND_SEMINAR': 0.50,
        'MEET_SUPERVISOR': 0.30,
        'BRAINSTORM_SESH': 1.0,
        'ARCHIVE_DIG': 0.40,
        'EUREKA': 1.0,
        'SELF_GUIDED': 0.30,
        'LEARN_SKILL': 0.20,
        'CRISIS_MEETING': 0.20 // Amber Wang
    };

    if (IDEA_TRIGGERS[action.id]) {
        if (gameState.availableIdeas.length < 5 && Math.random() < IDEA_TRIGGERS[action.id]) {
             generateIdea(action.label);
        }
    }
    
    // Check Game Over after action
    setGameState(prev => {
        const nextPhase = checkGameOver(prev.stats, prev.publishedPapers, prev.maxStats);
        return { ...prev, phase: nextPhase === GamePhase.PLAYING ? prev.phase : nextPhase };
    });
  };

  const handleInspectIdea = (idea: ResearchIdea) => {
      setSelectedIdea(idea);
  };

  const handleDevelopIdea = async (idea: ResearchIdea) => {
    if (gameState.activeProject) {
        addLog("You already have an active project! Finish it first.", 'warning');
        return;
    }
    
    if (gameState.stats.energy < COST.DEVELOP_IDEA.energy) {
        addLog("Too tired to develop a proposal.", 'danger');
        return;
    }

    // Check Supervisor Funding for High Resources
    const isHighResource = idea.resources > 70;
    if (isHighResource && gameState.supervisorState && gameState.supervisorState.funding < 5000) {
        addLog(`Advisor denied proposal: "We can't afford this equipment right now." (Requires Lab Funding)`, 'danger');
        return;
    }

    setGameState(prev => {
         const newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;
         newStats.energy -= COST.DEVELOP_IDEA.energy;
         newStats.physiological.stress += (COST.DEVELOP_IDEA.physiological?.stress || 0);

         const newProject: ActiveProject = {
            id: idea.id,
            title: idea.title,
            description: idea.description,
            progress: 0,
            failureCount: 0,
            status: 'RESEARCH', // Default status
            difficulty: idea.difficulty,
            potential: idea.potential,
            novelty: idea.novelty,
            feasibility: idea.feasibility,
            resources: idea.resources,
            attraction: idea.attraction
         };

         const remainingIdeas = prev.availableIdeas.filter(i => i.id !== idea.id);

         return {
             ...prev,
             stats: newStats,
             activeProject: newProject,
             availableIdeas: remainingIdeas
         };
    });

    addLog(`Proposal developed: "${idea.title}". Research started!`, 'info');
  };

  const handleResearch = async () => {
    if (!gameState.activeProject) return;
    
    const isRevision = gameState.activeProject.status === 'REVISION';
    const baseEnergyCost = 15;
    const resourcePenalty = gameState.activeProject.resources * 0.15; // Adjusted for 100 scale: e.g. 50 res = +7.5 cost
    const timeMgmtBonus = gameState.stats.skills.timeManagement * 0.1;
    const energyCost = Math.max(5, Math.floor(baseEnergyCost + resourcePenalty - timeMgmtBonus));

    if (gameState.stats.energy < energyCost) {
        addLog(`Not enough energy! Need ${energyCost}.`, 'danger');
        return;
    }
    
    setGameState(prev => {
        if (!prev.activeProject) return prev;
        
        let logMsg = "";
        let logType: LogEntry['type'] = 'info';

        // Check for Funding Crisis - Throttle Progress
        const fundingStalled = prev.supervisorState ? prev.supervisorState.funding <= 0 : false;
        
        // Risk Logic - Inputs are 1-100
        const riskScore = (prev.activeProject.novelty * 0.5) + (prev.activeProject.difficulty * 0.2) - (prev.activeProject.feasibility * 0.3) - (prev.stats.skills.analysis * 0.2);
        
        let failureChance = Math.max(5, Math.min(75, riskScore)); 
        if (isRevision) failureChance *= 0.5; 
        
        const isSetback = (Math.random() * 100) < failureChance;
        let actualProgress = prev.activeProject.progress;
        let failCount = prev.activeProject.failureCount || 0;
        const newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;

        newStats.energy -= energyCost;

        if (fundingStalled) {
            // FUNDING CRISIS THROTTLE
            actualProgress = Math.min(100, prev.activeProject.progress + 1); // Only +1 progress
            logMsg = "Lab funding depleted! Progress halted. You scavenged for scraps (+1%).";
            logType = 'warning';
            newStats.physiological.stress += 5;
        } 
        else if (isSetback) {
            failCount += 1;
            logMsg = isRevision ? "Revision hit a snag. Re-analyzing data..." : "SETBACK! Experiment failed. (+1 Setback count)";
            logType = 'danger';
            newStats.physiological.stress += 15;
            newStats.physiological.sanity -= 5;
            newStats.talents.resilience += 2; 
        } else {
            const baseProgress = 8;
            const skillPower = (prev.stats.skills.experiment * 0.4) + (prev.stats.talents.logic * 0.3) + (prev.stats.talents.focus * 0.3);
            const resistance = Math.max(10, prev.activeProject.difficulty + (prev.activeProject.novelty * 0.5));
            let progressGain = baseProgress + (skillPower * 10 / resistance) + (Math.random() * 5); 
            
            if (isRevision) progressGain *= 1.2; 
            
            const target = isRevision ? (prev.activeProject.revisionRequirement || 100) : 100;
            actualProgress = Math.min(target, prev.activeProject.progress + progressGain);
            
            logMsg = isRevision ? `Revision Progress (+${Math.round(progressGain)})` : `Progress made (+${Math.round(progressGain)}%).`;
            
            newStats.physiological.stress += 5;
            newStats.skills.experiment += 0.5; 
            newStats.skills.analysis += 0.5;

            if (prev.supervisorId) {
                const maxPrep = prev.maxStats.career.meetingPreparation || 100;
                const prepGain = 10 + (prev.stats.talents.focus / 10);
                newStats.career.meetingPreparation = Math.min(maxPrep, newStats.career.meetingPreparation + prepGain);
                logMsg += " Prep +10.";
            }
        }

        if (newStats.skills.experiment > prev.maxStats.skills.experiment) newStats.skills.experiment = prev.maxStats.skills.experiment;

        const nextPhase = checkGameOver(newStats, prev.publishedPapers, prev.maxStats);

        addLog(logMsg, logType);

        return {
            ...prev,
            activeProject: { ...prev.activeProject, progress: actualProgress, failureCount: failCount },
            stats: newStats,
            phase: nextPhase === GamePhase.PLAYING ? prev.phase : nextPhase
        };
    });
  };

  const handleFinalizeProject = () => {
     if (!gameState.activeProject) return;

     if (gameState.activeProject.status === 'REVISION' && gameState.activeProject.targetJournal) {
         handleSubmitToJournal(gameState.activeProject.targetJournal, true);
         return;
     }

     const proj = gameState.activeProject;
     const stats = gameState.stats;

     // Quality Formula for 0-100 scale
     // Max potential: ~100
     let quality = (proj.potential * 0.6) + (proj.novelty * 0.2) + (stats.skills.writing * 0.2);
     quality -= (proj.failureCount * 1); // Reduced penalty to 1
     quality = Math.max(10, Math.min(100, quality));

     setResearchCompleteData({ quality, journals: JOURNALS });
  };

  const handleSubmitToJournal = async (journal: Journal, isResubmission = false) => {
    if (!gameState.activeProject) return;
    
    // Check Fees
    const isOA = journal.costToSubmit && journal.costToSubmit > 0;
    if (!isResubmission && isOA) {
        // Use Supervisor Funding for OA
        if (gameState.supervisorState && gameState.supervisorState.funding < (journal.costToSubmit || 0)) {
            addLog(`Lab funding insufficient for ${journal.name} ($${journal.costToSubmit})`, 'danger');
            return;
        }
    }

    setResearchCompleteData(null); 
    setGameState(prev => ({ ...prev, loading: true }));
    
    await new Promise(r => setTimeout(r, 800));
    
    const proj = gameState.activeProject!;
    
    let resultStatus: SubmissionResult['status'] = 'REJECTED';
    let reviewType: ReviewType | undefined;
    let message = "";
    
    if (isResubmission) {
        const progress = proj.progress;
        const target = proj.revisionRequirement || 100;
        const completionRatio = progress / target;
        
        const chance = completionRatio * 100;
        const roll = Math.random() * 100;

        if (roll < chance) {
             resultStatus = 'ACCEPTED';
             message = "The reviewers are satisfied with your revisions. Accepted.";
        } else {
             resultStatus = 'REJECTED';
             message = "The revisions were insufficient. Rejection confirmed.";
        }

    } else {
        // Fresh Submission Logic - Recalculate Quality
        let quality = (proj.potential * 0.6) + (proj.novelty * 0.2) + (gameState.stats.skills.writing * 0.2);
        quality -= (proj.failureCount * 1); // Reduced penalty
        quality = Math.max(10, Math.min(100, quality));

        if (quality < journal.minimumQuality) {
            resultStatus = 'DESK_REJECT';
            message = "The paper does not meet our quality standards or scope.";
        } 
        else if (quality < journal.acceptQuality) {
            const range = journal.acceptQuality - journal.minimumQuality;
            const score = quality - journal.minimumQuality;
            const normalized = score / range; 
            
            // Supervisor Rep Bonus to Review Outcome
            const supBonus = gameState.supervisorState ? gameState.supervisorState.reputation * 0.005 : 0; // Small bonus to pass threshold
            const checkScore = normalized + supBonus;

            if (checkScore > 0.7) {
                resultStatus = 'PEER_REVIEW';
                reviewType = 'MINOR_REVISION';
                message = "The core methodology is sound, but Reviewer #2 has issues with your labels.";
            } else if (checkScore > 0.4) {
                resultStatus = 'PEER_REVIEW';
                reviewType = 'MAJOR_REVISION';
                message = "Significant issues found in the analysis section. Needs extensive rework.";
            } else {
                resultStatus = 'PEER_REVIEW';
                reviewType = 'RESUBMIT';
                message = "We cannot accept this in its current form. Reviewer #2 hates it.";
            }
        } 
        else {
            resultStatus = 'ACCEPTED';
            message = "We are pleased to accept your manuscript without changes. A miracle!";
        }
    }

    // Deduct OA Fees if applicable
    if (!isResubmission && isOA) {
        setGameState(prev => ({
            ...prev,
            supervisorState: prev.supervisorState ? {
                ...prev.supervisorState,
                funding: prev.supervisorState.funding - (journal.costToSubmit || 0)
            } : undefined
        }));
    }

    let rewards;
    if (resultStatus === 'ACCEPTED') {
         rewards = {
             reputation: journal.reputationReward,
             relationship: 5,
             stressRef: 20,
             sanity: 10,
             pressureRef: 50
         };
    }

    setSubmissionResult({
        status: resultStatus,
        journal: journal,
        reviewType: reviewType,
        message: message,
        rewards: rewards
    });
    setGameState(prev => ({ ...prev, loading: false }));

    if (resultStatus === 'ACCEPTED' || resultStatus === 'DESK_REJECT' || resultStatus === 'REJECTED') {
        finalizeSubmission(resultStatus === 'ACCEPTED', journal, proj);
    }
  };

  const handleReviewAction = (action: 'REVISE' | 'REBUT' | 'GIVEUP') => {
      if (!submissionResult || !gameState.activeProject) return;

      const { journal, reviewType } = submissionResult;
      
      if (action === 'GIVEUP') {
          finalizeSubmission(false, journal, gameState.activeProject);
          setSubmissionResult(null);
          return;
      }

      if (action === 'REVISE') {
           let requirement = 30; // Minor
           if (reviewType === 'MAJOR_REVISION') requirement = 60;
           if (reviewType === 'RESUBMIT') requirement = 90;

           setGameState(prev => {
                if(!prev.activeProject) return prev;
                return {
                    ...prev,
                    activeProject: {
                        ...prev.activeProject,
                        status: 'REVISION',
                        targetJournal: journal,
                        revisionRequirement: requirement,
                        progress: 0 
                    }
                };
           });
           
           addLog(`Project "${gameState.activeProject.title}" entered Revision Phase. Target: ${requirement} progress.`, 'info');
           setSubmissionResult(null); 
           return;
      }

      if (action === 'REBUT') {
          let successChance = 30; 
          if (reviewType === 'MINOR_REVISION') successChance = 60;
          if (Math.random() > 0.8) successChance += 40; 

          setGameState(prev => {
              const s = {...prev.stats};
              s.energy -= 10;
              s.physiological.stress += 25;
              return { ...prev, stats: s };
          });

          const accepted = Math.random() * 100 < successChance;
          
          let rewards;
          if (accepted) {
             rewards = {
                 reputation: journal.reputationReward,
                 relationship: 5,
                 stressRef: 20,
                 sanity: 10,
                 pressureRef: 50
             };
          }

          setSubmissionResult({
              ...submissionResult,
              status: accepted ? 'ACCEPTED' : 'REJECTED',
              reviewType: undefined, 
              message: accepted ? "Revisions accepted. Congratulations." : "Reviewer #2 was not convinced. Rejection confirmed.",
              rewards: rewards
          });

          finalizeSubmission(accepted, journal, gameState.activeProject);
      }
  };

  const finalizeSubmission = (accepted: boolean, journal: Journal, proj: ActiveProject) => {
    // Determine Quality (Recalculate or store previous)
    let quality = (proj.potential * 0.6) + (proj.novelty * 0.2) + (gameState.stats.skills.writing * 0.2);
    quality -= (proj.failureCount * 1); // Reduced penalty
    quality = Math.max(10, Math.min(100, quality));

    const newPaper: Paper = {
        id: proj.id,
        title: proj.title,
        field: gameState.field,
        quality: quality,
        citations: 0, 
        accepted: accepted,
        journalName: journal.name,
        citationFactor: journal.citationFactor,
        impactFactor: journal.impactFactor
    };

    setGameState(prev => {
        const newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;
        const newSupervisorState = prev.supervisorState ? { ...prev.supervisorState } : undefined;
        
        if (accepted) {
            newStats.career.reputation += journal.reputationReward;
            newStats.physiological.stress = Math.max(0, newStats.physiological.stress - 20);
            
            // Reward: Grants increase Lab Funding!
            if (newSupervisorState) {
                newSupervisorState.funding += 20000;
                newSupervisorState.reputation += 2; // Advisor also gets rep
            }

            newStats.career.supervisorRel += 5;
            newStats.physiological.sanity += 10;
            newStats.career.meetingExpectation = Math.max(0, newStats.career.meetingExpectation - 50);
        } else {
            newStats.physiological.stress += 15;
            newStats.physiological.sanity -= 10;
            newStats.talents.resilience += 2; 
            newStats.skills.writing += 1; 
            
            if (journal.reputationReward < 0) {
                 newStats.career.reputation -= 5;
            }
        }
        
        newStats.career.supervisorRel = Math.min(prev.maxStats.career.supervisorRel, newStats.career.supervisorRel);

        const nextPhase = checkGameOver(newStats, [...prev.publishedPapers, newPaper], prev.maxStats);

        return {
            ...prev,
            stats: newStats,
            supervisorState: newSupervisorState,
            activeProject: null,
            publishedPapers: [...prev.publishedPapers, newPaper],
            phase: nextPhase === GamePhase.PLAYING ? prev.phase : nextPhase,
            loading: false
        };
    });

    addLog(accepted ? `Paper ACCEPTED in ${journal.name}!` : `Paper REJECTED from ${journal.name}.`, accepted ? 'success' : 'danger');
  };


  const handleWorkOnMandatoryTask = () => {
    // "All Energy" Logic
    setGameState(prev => {
        if (!prev.mandatoryTask) return prev;
        
        const energySpend = prev.stats.energy;
        if (energySpend <= 0) return prev;
        
        // FUNDING CRISIS CHECK
        const fundingStalled = prev.supervisorState ? prev.supervisorState.funding <= 0 : false;

        const baseRate = 0.1;
        const writingMod = 1 + (prev.stats.skills.writing / 100);
        const focusMod = 1 + (prev.stats.talents.focus / 100);
        
        let progressMade = energySpend * baseRate * writingMod * focusMod;
        
        if (fundingStalled) {
             progressMade = 1; // Throttled
             addLog("No lab resources! You barely made any progress on the report.", 'warning');
        } else {
             const newLogs = [...prev.logs];
             newLogs.push({
                id: Date.now().toString() + Math.random(),
                turn: prev.turn,
                message: `Deep work session on ${prev.mandatoryTask.title}. Progress +${Math.round(progressMade)}. Prep +20.`,
                type: 'info'
             });
             // We can return here but I need to integrate with the state update below, so I'll just skip the else block usage
        }
        
        const newProgress = Math.min(prev.mandatoryTask.totalEffort, prev.mandatoryTask.progress + progressMade);
        
        const newStats = JSON.parse(JSON.stringify(prev.stats)) as PlayerStats;
        newStats.energy = 0; // Consumes ALL energy
        newStats.physiological.stress += 10; // High intensity work
        newStats.skills.writing += 0.5; // Slower skill gain

        if (prev.supervisorId) {
             const maxPrep = prev.maxStats.career.meetingPreparation || 100;
             const prepGain = 20; // High prep gain for report writing
             newStats.career.meetingPreparation = Math.min(maxPrep, newStats.career.meetingPreparation + prepGain);
        }

        if (newStats.physiological.stress > prev.maxStats.physiological.stress) newStats.physiological.stress = prev.maxStats.physiological.stress;

        const nextPhase = checkGameOver(newStats, prev.publishedPapers, prev.maxStats);

        return {
            ...prev,
            mandatoryTask: { ...prev.mandatoryTask, progress: newProgress },
            stats: newStats,
            phase: nextPhase === GamePhase.PLAYING ? prev.phase : nextPhase
        };
    });
  };

  const startGame = () => {
    if (!selectedBackground || !selectedSupervisor) return;

    const baseMaxStats = JSON.parse(JSON.stringify(MAX_STATS)) as PlayerStats;
    
    const updateMax = (category: keyof PlayerStats, modifier: any) => {
             if (!modifier) return;
             const target = baseMaxStats[category] as any;
             Object.entries(modifier).forEach(([key, val]) => {
                 if (target[key] !== undefined) {
                     target[key] += val as number;
                 }
             });
    };

    if (selectedBackground.maxStatModifiers) {
        if (selectedBackground.maxStatModifiers.energy) baseMaxStats.energy += selectedBackground.maxStatModifiers.energy;
        updateMax('physiological', selectedBackground.maxStatModifiers.physiological);
        updateMax('talents', selectedBackground.maxStatModifiers.talents);
        updateMax('skills', selectedBackground.maxStatModifiers.skills);
        updateMax('career', selectedBackground.maxStatModifiers.career);
    }
    if (selectedSupervisor.maxStatModifiers) {
        if (selectedSupervisor.maxStatModifiers.energy) baseMaxStats.energy += selectedSupervisor.maxStatModifiers.energy;
        updateMax('physiological', selectedSupervisor.maxStatModifiers.physiological);
        updateMax('talents', selectedSupervisor.maxStatModifiers.talents);
        updateMax('skills', selectedSupervisor.maxStatModifiers.skills);
        updateMax('career', selectedSupervisor.maxStatModifiers.career);
    }

    if (selectedSupervisor.meetingConfig) {
        baseMaxStats.career.meetingExpectation = selectedSupervisor.meetingConfig.expectationCap;
        baseMaxStats.career.meetingPreparation = selectedSupervisor.meetingConfig.preparationCap;
    }


    const newStats = JSON.parse(JSON.stringify(INITIAL_GAME_STATE.stats)) as PlayerStats;

    const applyMods = (mods: Partial<PlayerStats>) => {
        updateStatsCategories(newStats, mods, baseMaxStats);
    };

    applyMods(selectedBackground.initialModifiers);
    applyMods(selectedSupervisor.initialModifiers);
    
    // Explicitly clamp start stats to max stats in case base > max (e.g. Energy)
    newStats.energy = Math.min(newStats.energy, baseMaxStats.energy);
    newStats.physiological.health = Math.min(newStats.physiological.health, baseMaxStats.physiological.health);
    newStats.physiological.sanity = Math.min(newStats.physiological.sanity, baseMaxStats.physiological.sanity);
    newStats.physiological.stress = Math.min(newStats.physiological.stress, baseMaxStats.physiological.stress);

    const styleDiff = Math.abs(selectedBackground.personality.workStyle - selectedSupervisor.personality.workStyle);
    const motivDiff = Math.abs(selectedBackground.personality.motivation - selectedSupervisor.personality.motivation);
    const totalDiff = styleDiff + motivDiff;
    
    const relModifier = Math.round(20 - (totalDiff / 5));
    
    newStats.career.supervisorRel = Math.max(0, newStats.career.supervisorRel + relModifier);
    newStats.career.supervisorRel = Math.min(50, newStats.career.supervisorRel);

    let vibeMessage = "";
    if (relModifier >= 15) vibeMessage = "You and your supervisor clicked instantly! You finish each other's sentences.";
    else if (relModifier >= 5) vibeMessage = "The initial meeting went well. You seem to be on the same page.";
    else if (relModifier >= -5) vibeMessage = "Your supervisor seems professional, though a bit distant.";
    else if (relModifier >= -15) vibeMessage = "There is some friction. Your working styles are quite different.";
    else vibeMessage = "Disaster. You have fundamentally different worldviews. Expect conflict.";

    const extraActions = [
        ...(selectedBackground.exclusiveActions || []),
        ...(selectedSupervisor.exclusiveActions || [])
    ];
    setCombinedExtraActions(extraActions);

    let initialDebt = 0;
    let initialDeadline = null;

    if (selectedBackground.initialDebt) {
        initialDebt = selectedBackground.initialDebt;
        initialDeadline = 24; // Give them 24 weeks (~6 months) to pay it off
    }

    setGameState(prev => ({
        ...prev,
        phase: GamePhase.MECHANICS_INTRO, 
        stats: newStats,
        maxStats: baseMaxStats, 
        supervisorId: selectedSupervisor.id,
        // Initialize dynamic supervisor stats
        supervisorState: {
            funding: selectedSupervisor.initialFunding,
            reputation: selectedSupervisor.reputation,
            grantProgress: null // Init grant status
        },
        backgroundId: selectedBackground.id,
        mandatoryTask: JSON.parse(JSON.stringify(CONFIRMATION_TASK)),
        playerDebt: initialDebt, 
        loanDeadline: initialDeadline,
        logs: [
            {
                id: 'init',
                turn: 1,
                message: `Welcome to the lab! You are ${selectedBackground.name}, working for ${selectedSupervisor.name}. ${vibeMessage}`,
                type: relModifier > 0 ? 'success' : relModifier < -10 ? 'danger' : 'info'
            }
        ]
    }));
  };
  
  const handleConfirmMechanics = () => {
    setGameState(prev => ({ ...prev, phase: GamePhase.PLAYING }));
  };

  const handleReset = () => {
    setSetupStep(1);
    setGameState(INITIAL_GAME_STATE);
    setSelectedBackground(null);
    setSelectedSupervisor(null);
    shuffleOptions();
  };

  const calculateMetrics = () => {
      const accepted = gameState.publishedPapers.filter(p => p.accepted);
      const citations = accepted.reduce((acc, p) => acc + p.citations, 0);
      const sortedCits = accepted.map(p => p.citations).sort((a, b) => b - a);
      let hIndex = 0;
      for(let i=0; i<sortedCits.length; i++) {
          if(sortedCits[i] >= i + 1) hIndex = i + 1;
          else break;
      }
      return { citations, hIndex };
  };

  // Phase: Setup
  if (gameState.phase === GamePhase.SETUP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-100 p-3 rounded-full">
                    <GraduationCap size={32} className="text-blue-600" />
                </div>
                <div>
                    <h1 className="serif text-3xl font-bold text-slate-900">Publish or Perish</h1>
                    <p className="text-slate-500">Physics, Chemistry & Materials Dept.</p>
                </div>
            </div>

            {/* Step 1: Background - Expanded Card Style */}
            {setupStep === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <User size={24} /> Step 1: Who are you?
                        </h2>
                        <button 
                          onClick={shuffleOptions} 
                          className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                          title="Reroll Candidates"
                        >
                          <Shuffle size={14} /> Reroll
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {offeredBackgrounds.map(bg => (
                            <button
                                key={bg.id}
                                onClick={() => setSelectedBackground(bg)}
                                className={`group relative p-0 border rounded-xl text-left transition-all overflow-hidden ${
                                    selectedBackground?.id === bg.id 
                                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                }`}
                            >
                                {/* Header Section with Color */}
                                <div className={`h-2 w-full ${bg.imageColor}`}></div>
                                
                                <div className="p-5 flex flex-col md:flex-row gap-5">
                                    {/* Left: Identity */}
                                    <div className="shrink-0 flex md:flex-col items-center md:items-start gap-4 md:w-48">
                                        <div className={`w-16 h-16 shrink-0 rounded-full ${bg.imageColor} flex items-center justify-center text-white font-bold text-2xl shadow-sm ring-4 ring-white`}>
                                                {bg.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{bg.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{bg.education}</p>
                                        </div>
                                    </div>

                                    {/* Right: Stats & Mechanics */}
                                    <div className="flex-1 space-y-4">
                                        <div className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                                            "{bg.description}"
                                        </div>

                                        {/* Stats Grid - structured to avoid wrapping issues */}
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                                    <Activity size={12} /> Initial Stats
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                    {/* Funds */}
                                                    {bg.initialModifiers.funds ? (
                                                        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded border border-green-200 flex items-center gap-1">
                                                            <Wallet size={12} />
                                                            {bg.initialModifiers.funds > 0 ? '+' : ''}{bg.initialModifiers.funds}
                                                        </div>
                                                    ) : null}

                                                    {/* Debt - Highlighting this specifically */}
                                                    {bg.initialDebt ? (
                                                        <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded border border-red-200 flex items-center gap-1">
                                                            <Banknote size={12} />
                                                            DEBT: ${bg.initialDebt}
                                                        </div>
                                                    ) : null}
                                                    
                                                    {/* Physiological */}
                                                    {Object.entries(bg.initialModifiers.physiological || {}).map(([key, val]) => (
                                                        <div key={key} className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 capitalize ${
                                                            (val as number) > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                        }`}>
                                                            {key === 'stress' ? (val as number) > 0 ? <TrendingUp size={12}/> : <Smile size={12}/> : <Heart size={12}/>}
                                                            {key} {(val as number) > 0 ? '+' : ''}{val}
                                                        </div>
                                                    ))}

                                                    {/* Talents/Skills/Energy mixed */}
                                                    {bg.initialModifiers.energy ? (
                                                        <div className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 ${
                                                            bg.initialModifiers.energy > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                            <Zap size={12} /> Energy {bg.initialModifiers.energy > 0 ? '+' : ''}{bg.initialModifiers.energy}
                                                        </div>
                                                    ) : null}

                                                    {Object.entries(bg.initialModifiers.talents || {}).map(([key, val]) => (
                                                        <div key={key} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium rounded flex items-center gap-1 capitalize">
                                                            <Sparkles size={12}/> {key} {(val as number) > 0 ? '+' : ''}{val}
                                                        </div>
                                                    ))}

                                                    {Object.entries(bg.initialModifiers.skills || {}).map(([key, val]) => (
                                                        <div key={key} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium rounded flex items-center gap-1 capitalize">
                                                            <BookOpen size={12}/> {key.replace(/([A-Z])/g, ' $1').trim()} {(val as number) > 0 ? '+' : ''}{val}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Mechanics Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Passive */}
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                                                        <CalendarClock size={12} /> Weekly Passive
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{bg.weeklyModifier.description}</p>
                                            </div>

                                            {/* Unique Action */}
                                            {bg.exclusiveActions && bg.exclusiveActions.length > 0 && (
                                                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 mb-1 flex items-center gap-2">
                                                            <Star size={12} /> Unique Action
                                                        </div>
                                                        <div className="flex items-start gap-2">
                                                            <div className="text-xs font-bold text-amber-800">{bg.exclusiveActions[0].label}</div>
                                                        </div>
                                                        <p className="text-xs text-amber-700/80 mt-0.5">{bg.exclusiveActions[0].description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button 
                            disabled={!selectedBackground}
                            onClick={() => setSetupStep(2)}
                            className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Supervisor - Google Scholar Style + Detailed Mechanics */}
            {setupStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <UserCheck size={24} /> Step 2: Choose your Supervisor
                        </h2>
                         <button 
                          onClick={shuffleOptions} 
                          className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                          title="Reroll Candidates"
                        >
                          <Shuffle size={14} /> Reroll
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {offeredSupervisors.map(sup => (
                            <button
                                key={sup.id}
                                onClick={() => setSelectedSupervisor(sup)}
                                className={`group relative p-0 border rounded-xl text-left transition-all overflow-hidden w-full ${
                                    selectedSupervisor?.id === sup.id 
                                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                }`}
                            >
                                {/* Header Strip */}
                                <div className={`h-2 w-full ${sup.imageColor}`}></div>

                                <div className="p-5 flex flex-col gap-5">
                                    {/* Top Section: Profile & Metrics (Scholar Style) */}
                                    <div className="flex flex-col md:flex-row gap-5 items-start">
                                        {/* Avatar */}
                                        <div className={`w-20 h-20 shrink-0 rounded-full ${sup.imageColor} flex items-center justify-center text-white font-bold text-2xl shadow-sm ring-4 ring-white overflow-hidden bg-slate-50`}>
                                            {sup.name.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-blue-700 hover:underline leading-tight">{sup.name}</h3>
                                            <p className="text-slate-600 font-medium">{sup.title}, {sup.institution}</p>
                                            <div className="text-xs text-slate-500 mt-0.5 mb-3 italic">Verified email at {sup.institution.split(' ').pop()?.toLowerCase()}.edu</div>

                                            {/* Metrics & Vague Stats Row */}
                                            <div className="flex flex-wrap gap-4 items-end">
                                                {/* Google Scholar Table */}
                                                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 w-fit">
                                                    <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                                                        <div className="font-bold"></div>
                                                        <div className="text-right text-slate-400">All</div>
                                                        <div className="text-right text-slate-400">Since 2024</div>
                                                        
                                                        <div className="font-bold text-blue-700">Citations</div>
                                                        <div className="text-right">{sup.stats.citations.toLocaleString()}</div>
                                                        <div className="text-right">{Math.floor(sup.stats.citations * 0.4).toLocaleString()}</div>

                                                        <div className="font-bold text-blue-700">h-index</div>
                                                        <div className="text-right">{sup.stats.hIndex}</div>
                                                        <div className="text-right">{Math.floor(sup.stats.hIndex * 0.8)}</div>
                                                    </div>
                                                </div>

                                                {/* Lab Status Badges */}
                                                <div className="flex flex-col gap-2">
                                                     <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-100">
                                                        <Wallet size={12} />
                                                        <span className="font-bold">{getFundingDesc(sup.initialFunding)}</span>
                                                     </div>
                                                     <div className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-800 px-2 py-1 rounded border border-indigo-100">
                                                        <TrendingUp size={12} />
                                                        <span className="font-bold">{getReputationDesc(sup.reputation)}</span>
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                                        "{sup.description}"
                                    </div>

                                    {/* Bottom Section: Mechanics (Student Style) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        
                                        {/* Left Column: Stats Modifiers */}
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-3">
                                            {/* Start Mods */}
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                                                    <Activity size={12} /> Starting Bonus
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Funds */}
                                                    {sup.initialModifiers.funds ? (
                                                        <div className={`px-2 py-1 text-xs font-bold rounded border flex items-center gap-1 ${
                                                            sup.initialModifiers.funds > 0 
                                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                                            : 'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                            <Wallet size={12} /> {sup.initialModifiers.funds > 0 ? '+' : ''}{sup.initialModifiers.funds}
                                                        </div>
                                                    ) : null}
                                                    {/* Stress/Sanity/Relationship */}
                                                    {['stress', 'sanity', 'health'].map(k => {
                                                        const val = sup.initialModifiers.physiological?.[k as keyof PhysiologicalStats];
                                                        if (val) {
                                                            return (
                                                                <div key={k} className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 capitalize ${
                                                                    (k === 'stress' && val < 0) || (k !== 'stress' && val > 0) 
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                                                }`}>
                                                                    {k === 'stress' ? <TrendingUp size={12}/> : <Heart size={12}/>}
                                                                    {k} {val > 0 ? '+' : ''}{val}
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    })}
                                                    {/* Relationship */}
                                                    {sup.initialModifiers.career?.supervisorRel ? (
                                                        <div className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-100`}>
                                                            <UserCheck size={12} /> Rel {sup.initialModifiers.career.supervisorRel > 0 ? '+' : ''}{sup.initialModifiers.career.supervisorRel}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            
                                            {/* Max Cap Mods */}
                                            {sup.maxStatModifiers && Object.keys(sup.maxStatModifiers).length > 0 && (
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                                                        <TrendingUp size={12} /> Stat Caps
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(sup.maxStatModifiers).map(([cat, mods]) => {
                                                            if (typeof mods === 'number') return null; // Skip top level numbers for now if handled elsewhere
                                                            return Object.entries(mods as any).map(([k, v]) => (
                                                                <div key={k} className={`px-2 py-1 text-xs font-medium rounded border flex items-center gap-1 capitalize ${
                                                                    (v as number) > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                                                }`}>
                                                                    Max {k} {(v as number) > 0 ? '+' : ''}{v as number}
                                                                </div>
                                                            ));
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Gameplay Mechanics */}
                                        <div className="space-y-3">
                                            {/* Weekly */}
                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                                                    <CalendarClock size={12} /> Weekly Effect
                                                </div>
                                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{sup.weeklyModifier.description}</p>
                                            </div>

                                            {/* Action */}
                                            {sup.exclusiveActions && sup.exclusiveActions.length > 0 && (
                                                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 mb-1 flex items-center gap-2">
                                                        <Star size={12} /> Unique Action
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="text-xs font-bold text-amber-800">{sup.exclusiveActions[0].label}</div>
                                                    </div>
                                                    <p className="text-xs text-amber-700/80 mt-0.5">{sup.exclusiveActions[0].description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-between">
                         <button 
                            onClick={() => setSetupStep(1)}
                            className="text-slate-500 hover:text-slate-800 font-medium px-4"
                        >
                            Back
                        </button>
                        <button 
                            disabled={!selectedSupervisor}
                            onClick={startGame}
                            className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
                        >
                            Start PhD Journey
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

  const { stats, maxStats, supervisorState } = gameState;
  const { citations, hIndex } = calculateMetrics();
  const currentBackground = BACKGROUND_POOL.find(b => b.id === gameState.backgroundId);
  
  // Predict Energy Recovery for UI display
  // We simulate the decay that happens in handleNextWeek first
  const predictedStats = JSON.parse(JSON.stringify(gameState.stats)) as PlayerStats;
  predictedStats.physiological.health = Math.max(0, predictedStats.physiological.health - 1);
  predictedStats.physiological.sanity = Math.max(0, predictedStats.physiological.sanity - 2);
  predictedStats.physiological.stress = Math.max(0, predictedStats.physiological.stress - 5);
  
  const nextWeekRecoveryPrediction = calculateEnergyRecovery(predictedStats, maxStats);
  
  let researchCost = 15;
  if (gameState.activeProject) {
      const baseEnergyCost = 15;
      const resourcePenalty = gameState.activeProject.resources * 0.15; // Adjusted cost for 1-100 scale
      const timeMgmtBonus = stats.skills.timeManagement * 0.1;
      researchCost = Math.max(5, Math.floor(baseEnergyCost + resourcePenalty - timeMgmtBonus));
  }

  const canResearch = stats.energy >= researchCost;
  const canWrite = stats.energy >= COST.WRITE_PAPER.energy;

  // Phase: Game Over
  if (gameState.phase !== GamePhase.PLAYING && gameState.phase !== GamePhase.CONFIRMATION_REVIEW && gameState.phase !== GamePhase.MECHANICS_INTRO) {
      const isWin = gameState.phase === GamePhase.GAMEOVER_WIN;
      const isBroke = gameState.phase === GamePhase.GAMEOVER_BROKE;
      const isExpelled = gameState.phase === GamePhase.GAMEOVER_EXPELLED;
      const isBurnout = gameState.phase === GamePhase.GAMEOVER_BURNOUT;
      const isRelationshipFail = gameState.phase === GamePhase.GAMEOVER_RELATIONSHIP;
      const isInsanity = gameState.phase === GamePhase.GAMEOVER_INSANITY;
      const isHospitalized = gameState.phase === GamePhase.GAMEOVER_HOSPITALIZED;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {isWin ? (
                    <>
                        <Award size={64} className="mx-auto text-yellow-500 mb-6" />
                        <h2 className="serif text-3xl font-bold text-slate-900 mb-4">Congratulations, Doctor!</h2>
                        <p className="text-slate-600 mb-6">You have successfully defended your thesis, published enough papers, and survived the peer review process with your sanity (mostly) intact.</p>
                    </>
                ) : (
                    <>
                        <div className="relative inline-block mb-6">
                            {isHospitalized ? <HeartCrack size={64} className="mx-auto text-rose-500" /> :
                             isRelationshipFail ? <UserX size={64} className="mx-auto text-slate-500" /> :
                             isInsanity ? <Brain size={64} className="mx-auto text-purple-500" /> :
                             isBroke ? <Wallet size={64} className="mx-auto text-emerald-600" /> :
                             <Frown size={64} className="mx-auto text-red-500" />}
                            
                            {isExpelled && <DoorOpen size={32} className="absolute -bottom-2 -right-4 text-slate-400" />}
                        </div>
                        <h2 className="serif text-3xl font-bold text-slate-900 mb-4">
                            {isBroke ? "Financial Ruin" : 
                             isExpelled ? "Expelled" : 
                             isBurnout ? "Academic Burnout" :
                             isRelationshipFail ? "Fired from Lab" :
                             isInsanity ? "Psychotic Break" :
                             isHospitalized ? "Medical Withdrawal" : "Game Over"}
                        </h2>
                        <p className="text-slate-600 mb-6">
                            {isBroke && "You ran out of money (Debt > $1000) and had to drop out to work in industry. The horror."}
                            {isExpelled && "You failed your confirmation review. The department showed you the door."}
                            {isBurnout && "The stress was too much. You moved to a goat farm in Vermont."}
                            {isRelationshipFail && "Your supervisor has completely lost faith in you and removed you from the group."}
                            {isInsanity && "You lost your grip on reality. You are now writing proofs on the walls of your basement."}
                            {isHospitalized && "Your health collapsed completely. You have been placed on indefinite medical leave."}
                        </p>
                    </>
                )}
                
                {/* Stats Summary */}
                <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left">
                    <p className="font-bold text-slate-700 mb-2">Final Stats:</p>
                    <ul className="text-sm space-y-1 text-slate-600">
                        <li>Published Papers: {gameState.publishedPapers.filter(p => p.accepted).length}</li>
                        <li>Reputation: {gameState.stats.career.reputation}</li>
                        <li>Turns Survived: {gameState.turn} Weeks</li>
                    </ul>
                </div>

                <button 
                    onClick={handleReset}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
                >
                    <RotateCcw size={18} /> Play Again
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* 3 Column Grid Layout */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* MODALS */}
        {gameState.phase === GamePhase.MECHANICS_INTRO && selectedBackground && selectedSupervisor && (
            <MechanicsIntroModal 
                background={selectedBackground}
                supervisor={selectedSupervisor}
                onConfirm={handleConfirmMechanics}
                onReset={handleReset}
            />
        )}

        {pendingRandomEvent && (
            <RandomEventModal 
                event={pendingRandomEvent}
                onClose={() => setPendingRandomEvent(null)}
            />
        )}

        {gameState.phase === GamePhase.CONFIRMATION_REVIEW && gameState.mandatoryTask && (
            <ConfirmationModal 
                stats={gameState.stats}
                task={gameState.mandatoryTask}
                citations={citations}
                onResult={handleConfirmationOutcome}
            />
        )}

        {selectedIdea && (
            <IdeaDetailModal 
                idea={selectedIdea}
                stats={gameState.stats}
                cost={COST.DEVELOP_IDEA}
                onConfirm={() => {
                    handleDevelopIdea(selectedIdea);
                    setSelectedIdea(null);
                }}
                onClose={() => setSelectedIdea(null)}
            />
        )}

        {researchCompleteData && gameState.activeProject && (
            <ResearchCompleteModal 
                project={gameState.activeProject}
                quality={researchCompleteData.quality}
                journals={researchCompleteData.journals}
                onSelectJournal={handleSubmitToJournal}
                supervisorState={supervisorState}
            />
        )}

        {submissionResult && (
            <SubmissionResultModal 
                result={submissionResult}
                stats={gameState.stats}
                onClose={() => setSubmissionResult(null)}
                onReviewAction={handleReviewAction}
            />
        )}

        {/* Header */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 border-b border-slate-200 pb-4">
            <div>
                <h1 className="serif text-3xl font-black text-slate-900 tracking-tight">Publish or Perish</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                        {gameState.field.split('(')[0].trim()}
                    </span>
                    {gameState.supervisorId && (
                        <>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                                <UserCheck size={14} />
                                Advisor: {SUPERVISOR_POOL.find(s => s.id === gameState.supervisorId)?.name}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                {/* Player Stats */}
                <div className="text-right">
                    <div className="font-bold text-slate-800 text-lg leading-none mb-1">
                        {currentBackground?.name || "PhD Student"}
                    </div>
                    <div className="flex items-center justify-end gap-3 text-sm text-slate-500 font-mono">
                        <span title="Total Citations">
                            <span className="font-bold text-indigo-600">{citations}</span> Citations
                        </span>
                        <span className="text-slate-300">|</span>
                        <span title="h-index">
                            h-index <span className="font-bold text-indigo-600">{hIndex}</span>
                        </span>
                    </div>
                </div>

                {/* Week Counter */}
                <div className="bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Week</span>
                    <span className="text-3xl font-black leading-none">{gameState.turn}</span>
                </div>
            </div>
        </div>

        {/* Left Column: Stats & History (3/12) */}
        <div className="lg:col-span-3 space-y-6">
            <StatsBar stats={gameState.stats} maxStats={maxStats} currentRent={gameState.currentRent} />
            <PapersList papers={gameState.publishedPapers} />
        </div>

        {/* Middle Column: Active Research & Logs (6/12) */}
        <div className="lg:col-span-6 space-y-6">
            {gameState.mandatoryTask && (
                <MandatoryTaskCard 
                    task={gameState.mandatoryTask}
                    turn={gameState.turn}
                    energy={gameState.stats.energy}
                    onWorkTask={handleWorkOnMandatoryTask}
                    loading={gameState.loading}
                />
            )}

            <ProjectCard 
                project={gameState.activeProject}
                availableIdeas={gameState.availableIdeas}
                onInspectIdea={handleInspectIdea}
                onResearch={handleResearch}
                onFinalize={handleFinalizeProject}
                canResearch={canResearch}
                canWrite={canWrite}
                loading={gameState.loading}
                researchCostEnergy={researchCost}
            />
            
            <LogPanel logs={gameState.logs} />
        </div>

        {/* Right Column: Actions & Controls (3/12) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
            <button
                onClick={handleNextWeek}
                disabled={gameState.loading || gameState.phase === GamePhase.CONFIRMATION_REVIEW}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-4 rounded-xl shadow-md flex items-center justify-between group transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-slate-600 transition-colors">
                        <CalendarClock size={24} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold">Start Next Week</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <span>Pay Rent (-${gameState.currentRent})</span>
                            <span className="text-emerald-400 font-bold">& Recover +{nextWeekRecoveryPrediction} <Zap size={10} className="inline" /></span>
                        </div>
                    </div>
                </div>
                <ArrowRight size={20} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <AdvisorStatusPanel stats={gameState.stats} maxStats={maxStats} supervisorState={supervisorState} />

            <ActionsPanel 
              onAction={handleAction}
              loading={gameState.loading}
              stats={gameState.stats}
              extraActions={combinedExtraActions}
              supervisorState={supervisorState}
              supervisorId={gameState.supervisorId} // PASS SUPERVISOR ID FOR VISUAL LOGIC
              playerDebt={gameState.playerDebt} // Pass debt state
              loanDeadline={gameState.loanDeadline}
              turn={gameState.turn}
            />
        </div>

      </div>
    </div>
  );
}
