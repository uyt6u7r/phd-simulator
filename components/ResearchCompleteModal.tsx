
import React, { useState } from 'react';
import { ActiveProject, Journal, SupervisorState } from '../types';
import { ArrowRight, AlertTriangle, Check, X, DollarSign, Lock, Globe, TrendingUp } from 'lucide-react';

interface ResearchCompleteModalProps {
  project: ActiveProject;
  quality: number;
  journals: Journal[];
  onSelectJournal: (journal: Journal) => void;
  supervisorState?: SupervisorState; // New prop
}

export const ResearchCompleteModal: React.FC<ResearchCompleteModalProps> = ({ project, quality, journals, onSelectJournal, supervisorState }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const calculateChance = (journal: Journal) => {
      // 1. Desk Reject Check
      if (quality < journal.minimumQuality) return 0;

      // 2. Requirement Check
      let reqsMet = true;
      if (journal.specificRequirements) {
          if (journal.specificRequirements.novelty && project.novelty < journal.specificRequirements.novelty) reqsMet = false;
          if (journal.specificRequirements.feasibility && project.feasibility < journal.specificRequirements.feasibility) reqsMet = false;
          if (journal.specificRequirements.attraction && project.attraction < journal.specificRequirements.attraction) reqsMet = false;
          if (journal.specificRequirements.resources) {
               if (project.resources < journal.specificRequirements.resources) reqsMet = false;
          }
      }

      // 3. Probability Calculation
      if (!reqsMet) return 5; // Very low chance if reqs not met (Scope mismatch)
      if (quality >= journal.acceptQuality) return 99; // Almost guaranteed

      // Linear Interpolation
      const range = journal.acceptQuality - journal.minimumQuality;
      const diff = quality - journal.minimumQuality;
      let prob = (diff / range) * 100;
      
      // Supervisor Reputation Bonus
      if (supervisorState) {
          prob += supervisorState.reputation * 0.2; // e.g., 50 rep -> +10% chance
      }

      return Math.min(95, Math.max(5, prob));
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between shrink-0">
            <div>
                <h2 className="serif text-2xl font-bold text-slate-900">Research Complete</h2>
                <p className="text-slate-500 italic mt-1">Select a journal for "{project.title}"</p>
            </div>
            
            <div className="flex gap-6">
                <div className="text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Quality</div>
                    <div className="text-3xl font-black text-indigo-600">{Math.round(quality)}</div>
                </div>
                {supervisorState && (
                    <div className="text-center">
                         <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Advisor Boost</div>
                         <div className="text-xl font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                             <TrendingUp size={16} /> +{Math.round(supervisorState.reputation * 0.2)}%
                         </div>
                    </div>
                )}
                {project.failureCount > 0 && (
                     <div className="text-center">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">Setbacks</div>
                        <div className="text-xl font-bold text-red-500 flex items-center justify-center gap-1">
                            <AlertTriangle size={16} /> {project.failureCount}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Journals List */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 space-y-3">
            {journals.map(journal => {
                const isSelected = selected === journal.id;
                const chance = calculateChance(journal);
                const isOpenAccess = journal.costToSubmit && journal.costToSubmit > 0;
                
                // Color coding
                const chanceColor = 
                    chance === 0 ? 'text-slate-400' :
                    chance < 30 ? 'text-red-500' : 
                    chance < 70 ? 'text-amber-500' : 'text-emerald-600';

                return (
                    <button
                        key={journal.id}
                        onClick={() => setSelected(journal.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all relative grid grid-cols-12 gap-4 items-center ${
                            isSelected 
                            ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                    >
                         {/* Info (Cols 1-5) */}
                        <div className="col-span-5">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-slate-800 text-sm">{journal.name}</h3>
                                {isOpenAccess ? (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold flex items-center gap-1 border border-amber-200" title="Open Access: Paid from Lab Funding">
                                        <Globe size={10} /> OPEN ACCESS
                                        <span className="flex items-center text-amber-800 ml-1"><DollarSign size={8} />{journal.costToSubmit}</span>
                                    </span>
                                ) : (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold flex items-center gap-1 border border-slate-200">
                                        <Lock size={10} /> TRADITIONAL
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 italic truncate pr-2">{journal.description}</p>
                        </div>

                        {/* Metrics (Cols 6-8) */}
                        <div className="col-span-3 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Impact Factor:</span>
                                <span className="font-mono font-bold">{journal.impactFactor}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Rep Reward:</span>
                                <span className="font-mono font-bold text-blue-600">+{journal.reputationReward}</span>
                            </div>
                        </div>

                        {/* Requirements Check (Cols 9-10) */}
                        <div className="col-span-2 text-[10px]">
                            {journal.specificRequirements && Object.keys(journal.specificRequirements).length > 0 ? (
                                <div className="space-y-1">
                                    {Object.entries(journal.specificRequirements).map(([key, reqVal]) => {
                                        const projVal = project[key as keyof ActiveProject] as number;
                                        const met = projVal >= (reqVal as number);
                                        return (
                                            <div key={key} className={`flex items-center gap-1 ${met ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {met ? <Check size={10} /> : <X size={10} />}
                                                <span className="uppercase">{key.slice(0,4)} &gt; {reqVal}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <span className="text-slate-400 italic">No specific reqs</span>
                            )}
                        </div>

                        {/* Chance (Cols 11-12) */}
                        <div className="col-span-2 text-right">
                             <div className="text-[10px] font-bold uppercase text-slate-400">Acceptance</div>
                             <div className={`text-xl font-black ${chanceColor}`}>
                                 {chance === 0 ? '0%' : `~${Math.round(chance)}%`}
                             </div>
                             {chance === 0 && <div className="text-[10px] text-red-500 font-bold">Desk Reject</div>}
                        </div>
                        
                        {isSelected && (
                            <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none"></div>
                        )}
                    </button>
                )
            })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <button 
                disabled={!selected}
                onClick={() => {
                    const j = journals.find(j => j.id === selected);
                    if (j) onSelectJournal(j);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
            >
                Submit Paper <ArrowRight size={20} />
            </button>
        </div>

      </div>
    </div>
  );
};
