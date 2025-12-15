
import React from 'react';
import { BackgroundOption, SupervisorProfile, GameAction } from '../types';
import { Sparkles, Zap, CalendarClock, ArrowRight, Activity, RotateCcw, User, UserCheck, Briefcase } from 'lucide-react';

interface MechanicsIntroModalProps {
  background: BackgroundOption;
  supervisor: SupervisorProfile;
  onConfirm: () => void;
  onReset: () => void;
}

export const MechanicsIntroModal: React.FC<MechanicsIntroModalProps> = ({ background, supervisor, onConfirm, onReset }) => {
  
  // Helper to format stat changes
  const getCapChanges = (modifiers?: any) => {
    const caps: string[] = [];
    if (modifiers) {
       if (modifiers.energy) {
         const val = modifiers.energy;
         caps.push(`Energy ${val > 0 ? '+' : ''}${val}`);
       }
       
       const extractCaps = (cat: any) => {
         if(!cat) return;
         Object.entries(cat).forEach(([k, v]) => {
           const val = v as number;
           const label = k.charAt(0).toUpperCase() + k.slice(1);
           caps.push(`${label} ${val > 0 ? '+' : ''}${val}`);
         });
       };
       extractCaps(modifiers.physiological);
       extractCaps(modifiers.talents);
       extractCaps(modifiers.skills);
       extractCaps(modifiers.career);
    }
    return caps;
  };

  const renderCard = (
      title: string, 
      subtitle: string, 
      colorClass: string, 
      icon: any, 
      weeklyDesc: string,
      exclusiveActions: GameAction[] | undefined,
      maxStatModifiers: any,
      meetingConfig?: any
    ) => {
        const caps = getCapChanges(maxStatModifiers);
        const Icon = icon;

        return (
            <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col">
                <div className={`${colorClass} p-4 text-white relative overflow-hidden shrink-0`}>
                     <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4">
                        <Icon size={100} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg">{title}</h3>
                        <p className="opacity-90 text-xs">{subtitle}</p>
                    </div>
                </div>

                <div className="p-4 space-y-4 flex-1 text-sm">
                     {/* Weekly */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1 text-indigo-600 font-bold uppercase text-[10px] tracking-wider">
                            <CalendarClock size={12} />
                            Weekly Effect
                        </div>
                        <p className="text-slate-800 font-medium text-xs leading-relaxed">
                            {weeklyDesc}
                        </p>
                    </div>

                    {/* Action */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1 text-amber-600 font-bold uppercase text-[10px] tracking-wider">
                            <Zap size={12} />
                            Unique Action
                        </div>
                        {exclusiveActions && exclusiveActions.length > 0 ? (
                            <div>
                                <p className="text-slate-800 font-bold text-xs">{exclusiveActions[0].label}</p>
                                <p className="text-slate-500 text-[10px]">{exclusiveActions[0].description}</p>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs">None</p>
                        )}
                    </div>
                    
                    {/* Supervisor Meeting Config */}
                    {meetingConfig && (
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-1 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                <Briefcase size={12} />
                                Meeting Dynamics
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-slate-400">Weekly Pressure:</span>
                                    <span className="ml-1 font-mono font-bold text-red-600">+{meetingConfig.expectationGrowth}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Req. Prep:</span>
                                    <span className="ml-1 font-mono font-bold text-indigo-600">{meetingConfig.preparationCap}</span>
                                </div>
                            </div>
                        </div>
                    )}

                     {/* Traits */}
                    {caps.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                <Activity size={12} />
                                Stat Traits
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {caps.map((cap, i) => (
                                    <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        cap.includes('-') 
                                        ? 'bg-red-50 text-red-700 border border-red-100' 
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}>
                                        {cap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-center">
             <h2 className="serif text-2xl font-bold text-slate-900">Your Academic Setup</h2>
             <p className="text-slate-500 text-sm">Review your unique mechanics before starting.</p>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-6">
            {renderCard(
                background.name, 
                "The Candidate", 
                background.imageColor, 
                User, 
                background.weeklyModifier.description, 
                background.exclusiveActions, 
                background.maxStatModifiers
            )}

            <div className="flex items-center justify-center text-slate-300">
                <Sparkles size={32} />
            </div>

            {renderCard(
                supervisor.name, 
                "The Supervisor", 
                supervisor.imageColor, 
                UserCheck, 
                supervisor.weeklyModifier.description, 
                supervisor.exclusiveActions, 
                supervisor.maxStatModifiers,
                supervisor.meetingConfig
            )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
            <button 
                onClick={onReset}
                className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-colors flex items-center gap-2"
            >
                <RotateCcw size={18} /> Re-select
            </button>
            <button 
                onClick={onConfirm}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
                Confirm & Start <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};
