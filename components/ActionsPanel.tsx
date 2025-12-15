import React, { useState } from 'react';
import { 
  Coffee, Briefcase, BookOpen, User, Users, Heart, Sparkles, 
  Gamepad2, Utensils, Trash2, Home, Dumbbell, MonitorPlay, 
  Leaf, Phone, Beer, BookMarked, GraduationCap, Brain, Palette, Star,
  Lock, FileWarning, Banknote, Clock
} from 'lucide-react';
import { ACTIONS_DATA } from '../constants';
import { GameAction, ActionCategory, PlayerStats, ActionEffect, SupervisorState } from '../types';

interface ActionsPanelProps {
  onAction: (action: GameAction) => void;
  loading: boolean;
  stats: PlayerStats;
  extraActions?: GameAction[];
  supervisorState?: SupervisorState;
  supervisorId?: string; // New Prop to identify Kensington
  backgroundId?: string; // New Prop for background specific logic
  playerDebt: number; // New Prop to handle loan state
  loanDeadline: number | null; // New Prop
  turn: number; // New Prop
}

const ICONS: Record<string, any> = {
  SLEEP: Home,
  EXERCISE: Dumbbell,
  GOOD_MEAL: Utensils,
  CLEANING: Trash2,
  TAKE_LOAN: Banknote,
  GAMING: Gamepad2,
  SPACING_OUT: Coffee,
  TA_JOB: Briefcase,
  READ_PAPERS: BookOpen,
  ATTEND_SEMINAR: GraduationCap,
  TOUCH_GRASS: Leaf,
  DRINK_WITH_LAB: Beer,
  CALL_PARENTS: Phone,
  THERAPY: Heart,
  LEARN_SKILL: Brain,
  HOBBY: Palette,
  // Special Icons
  RETAIL_THERAPY: DollarSignIcon,
  EUREKA: ZapIcon,
  DELEGATE: Users,
  COOK_HOME: Utensils,
  PROTEST: MonitorPlay,
  POWER_NAP: Home,
  DATA_MANIPULATION: FileWarning,
  WEEKEND_OVERTIME: Clock,
  CALL_HOME: Phone
};

// Fallback icon helper
function DollarSignIcon(props: any) { return <span className="font-bold text-green-600">$</span> }
function ZapIcon(props: any) { return <Sparkles {...props} /> }


const CATEGORIES: { id: ActionCategory; label: string; icon: any }[] = [
  { id: 'LIFE', label: 'Life', icon: User },
  { id: 'ACADEMICS', label: 'Work', icon: BookMarked },
  { id: 'SOCIAL', label: 'Social', icon: Users },
  { id: 'SELF_IMPROVEMENT', label: 'Self', icon: Sparkles },
];

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ 
  onAction, 
  loading, 
  stats,
  extraActions = [],
  supervisorState,
  supervisorId,
  backgroundId,
  playerDebt,
  loanDeadline,
  turn
}) => {
  const activeTabDefault = 'LIFE'; // Default active tab
  const [activeTab, setActiveTab] = useState<ActionCategory>('ACADEMICS'); // Set ACADEMICS as default for visibility

  // Combine standard actions with extra actions
  const allActions = [...Object.values(ACTIONS_DATA), ...extraActions];
  const actions = allActions.filter(a => a.category === activeTab);

  const getDynamicActionProps = (action: GameAction) => {
    let cost = { ...action.cost };
    let effect = { ...action.effect };
    let isDisabled = false;
    let disableReason = "";
    let label = action.label;
    let description = action.description;

    // Specific logic for PUSH_FUNDING
    if (action.id === 'PUSH_FUNDING') {
        // KENSINGTON OVERRIDE VISUALS
        if (supervisorId === 'KENSINGTON') {
             cost = { ...cost, energy: (cost.energy || 30) / 2 };
             // Override Effect display: Positive Relationship
             effect = { ...effect, career: { supervisorRel: 5 } };
             // Kensington doesn't have the <5 rel requirement
        } else {
             // STANDARD LOGIC
             const presentation = stats.skills.presentation;
             const reduction = Math.floor(presentation / 5);
             const baseStress = 20;
             const baseSanityCost = 20;
             
             const actualStress = Math.max(5, baseStress - reduction);
             const actualSanityCost = Math.max(5, baseSanityCost - reduction);
    
             // Override visual props
             cost = { ...cost, physiological: { stress: actualStress } };
             effect = { 
                 ...effect, 
                 physiological: { ...effect.physiological, sanity: -actualSanityCost } 
             };
    
             if (stats.career.supervisorRel < 5) {
                 isDisabled = true;
                 disableReason = "Advisor relationship too low (<5)";
             }
        }
    }

    // Specific logic for TAKE_LOAN (Swap to Repay or Disable for International)
    if (action.id === 'TAKE_LOAN') {
        if (backgroundId === 'INTERNATIONAL') {
            isDisabled = true;
            disableReason = "Visa Restrictions";
        } else if (playerDebt > 0) {
            label = `Repay Loan ($${playerDebt})`;
            description = `Pay off debt completely. Interest accruing weekly.`;
            cost = { ...cost, funds: playerDebt, physiological: { stress: 0 } } as any; // Remove taking cost
            effect = { physiological: { stress: -15, sanity: 15 } }; // Relief & Sanity
        } else {
            description = "Borrow $5000 (20 weeks, 1% interest).";
        }
    }

    return { cost, effect, isDisabled, disableReason, label, description };
  };

  const canAfford = (action: GameAction, dynamicCost: any) => {
    // Check Top Level
    if (dynamicCost.energy && stats.energy < dynamicCost.energy) return false;
    if (dynamicCost.funds && stats.funds < dynamicCost.funds) return false;
    return true;
  };

  // Helper to flatten effects for display
  const getEffectBadges = (effect: ActionEffect, actionId: string) => {
    const badges: { label: string; val: number; type: 'good' | 'bad' | 'neutral' }[] = [];

    if (effect.energy) badges.push({ label: 'Energy', val: effect.energy, type: effect.energy > 0 ? 'good' : 'bad' });
    if (effect.funds) badges.push({ label: 'Funds', val: effect.funds, type: effect.funds > 0 ? 'good' : 'bad' });

    const processCategory = (category: any, prefix = '') => {
        if (!category) return;
        Object.entries(category).forEach(([key, value]) => {
            const val = value as number;
            // Determine if it's "good" or "bad". 
            // Stress going down is good. Everything else going up is generally good.
            let type: 'good' | 'bad' | 'neutral' = 'neutral';
            if (key === 'stress') {
                type = val < 0 ? 'good' : 'bad';
            } else {
                type = val > 0 ? 'good' : 'bad';
            }
            
            // Format label (camelCase to Title Case approx)
            let niceLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            if (key === 'supervisorRel') niceLabel = 'Advisor Rel';
            if (key === 'timeManagement') niceLabel = 'Time Mgmt';
            if (key === 'meetingPreparation') niceLabel = 'Prep';
            if (key === 'meetingExpectation') niceLabel = 'Pressure';

            badges.push({ label: niceLabel, val, type });
        });
    };

    processCategory(effect.physiological);
    processCategory(effect.talents);
    processCategory(effect.skills);
    processCategory(effect.career);
    
    return badges;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Header / Tabs */}
      <div className="flex border-b border-slate-200">
        {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
                <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                        isActive 
                        ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{cat.label}</span>
                </button>
            );
        })}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        {actions.length === 0 && (
            <div className="text-center text-slate-400 py-8 text-sm italic">No actions available in this category.</div>
        )}
        {actions.map((action) => {
          const Icon = ICONS[action.id] || Star;
          const { cost: dynamicCost, effect: dynamicEffect, isDisabled, disableReason, label, description } = getDynamicActionProps(action);
          
          const affordable = canAfford(action, dynamicCost);
          const effects = getEffectBadges(dynamicEffect, action.id);
          const isSpecial = extraActions.some(ea => ea.id === action.id);
          
          const isDemandFunding = action.id === 'PUSH_FUNDING';
          const isGrantPending = isDemandFunding && supervisorState && supervisorState.grantProgress !== null;
          
          let cardStyle = 'bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-200';
          if (isSpecial) cardStyle = 'bg-amber-50 border-amber-200 hover:bg-amber-100';
          if (isDemandFunding) {
             if (supervisorId === 'KENSINGTON') {
                 // Green style for Kensington funding demand
                 cardStyle = 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
             } else {
                 cardStyle = 'bg-red-50 border-red-200 hover:bg-red-100';
             }
          }
          
          // Loan styling
          const isLoan = action.id === 'TAKE_LOAN';
          if (isLoan && playerDebt > 0) cardStyle = 'bg-purple-50 border-purple-200 hover:bg-purple-100';

          return (
            <button 
              key={action.id}
              onClick={() => onAction(action)}
              disabled={loading || !affordable || isGrantPending || isDisabled}
              className={`w-full flex flex-col p-2.5 rounded-lg border transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-left relative overflow-hidden ${cardStyle}`}
            >
              {/* Grant Progress Overlay */}
              {isGrantPending && supervisorState && (
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center flex-col p-2">
                       <span className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Application Pending...</span>
                       <div className="h-2 w-full max-w-[80%] bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                           <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${supervisorState.grantProgress}%` }}></div>
                       </div>
                       <span className="text-slate-600 font-bold text-xs mt-1">{supervisorState.grantProgress}%</span>
                  </div>
              )}
              
              {/* Disabled Overlay for Condition */}
              {isDisabled && (
                 <div className="absolute inset-0 bg-slate-100/80 z-10 flex items-center justify-center flex-col p-2 backdrop-blur-[1px]">
                     <Lock size={16} className="text-slate-400 mb-1" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{disableReason}</span>
                 </div>
              )}

              {/* Top Row: Icon, Title, Cost */}
              <div className="flex items-start justify-between w-full mb-1">
                 <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-full shrink-0 ${
                        isDemandFunding ? (supervisorId === 'KENSINGTON' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600') :
                        isSpecial ? 'bg-amber-100 text-amber-700' : 
                        isLoan && playerDebt > 0 ? 'bg-purple-100 text-purple-700' :
                        affordable ? 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-indigo-600' : 'bg-slate-100 text-slate-300'
                    }`}>
                        <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                        <div className={`font-semibold text-sm truncate flex items-center gap-2 ${isDemandFunding ? (supervisorId === 'KENSINGTON' ? 'text-emerald-700' : 'text-red-700') : 'text-slate-700'}`}>
                            {label}
                            {isSpecial && <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 rounded-full font-bold">UNIQUE</span>}
                        </div>
                        <div className={`text-xs truncate w-full pr-2 ${isDemandFunding ? (supervisorId === 'KENSINGTON' ? 'text-emerald-500' : 'text-red-400') : 'text-slate-400'}`}>{description}</div>
                    </div>
                 </div>

                 <div className="flex flex-col items-end text-xs font-medium gap-0.5 shrink-0 ml-1">
                     {dynamicCost.energy ? (
                         <span className={`${stats.energy < dynamicCost.energy ? 'text-red-500' : 'text-slate-500'}`}>-{dynamicCost.energy} En</span>
                     ) : null}
                     {dynamicCost.funds ? (
                         <span className={`${stats.funds < dynamicCost.funds ? 'text-red-500' : 'text-slate-500'}`}>-${dynamicCost.funds}</span>
                     ) : null}
                     {dynamicCost.funds === 0 && dynamicCost.energy === 0 && <span className="text-emerald-600">Free</span>}
                 </div>
              </div>
              
              {/* Deadline Indicator for Loan */}
              {isLoan && playerDebt > 0 && loanDeadline && (
                  <div className="ml-[42px] mb-1 text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <Clock size={10} />
                      Due in {Math.max(0, loanDeadline - turn)} weeks
                  </div>
              )}

              {/* Bottom Row: Effect Badges */}
              <div className="flex flex-wrap gap-1 ml-[42px]">
                  {effects.map((eff, i) => (
                      <span key={i} className={`text-[10px] px-1.5 rounded border ${
                          eff.type === 'good' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          eff.type === 'bad' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                          {eff.label} {eff.val > 0 ? '+' : ''}{eff.val}
                      </span>
                  ))}
                  {/* Show stress cost explicitly here if it's dynamic/hidden */}
                  {dynamicCost.physiological?.stress ? (
                      <span className="text-[10px] px-1.5 rounded border bg-red-50 text-red-700 border-red-100">
                          Stress +{dynamicCost.physiological.stress}
                      </span>
                  ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};