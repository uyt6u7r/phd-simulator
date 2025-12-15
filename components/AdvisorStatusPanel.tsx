

import React from 'react';
import { PlayerStats, SupervisorState } from '../types';
import { Briefcase, MessageCircle, AlertCircle, TrendingUp, Wallet } from 'lucide-react';

interface AdvisorStatusPanelProps {
  stats: PlayerStats;
  maxStats: PlayerStats;
  supervisorState?: SupervisorState; // New prop
}

export const AdvisorStatusPanel: React.FC<AdvisorStatusPanelProps> = ({ stats, maxStats, supervisorState }) => {
  const expectation = stats.career.meetingExpectation;
  const maxExpectation = maxStats.career.meetingExpectation || 100;
  const expectationPct = Math.min((expectation / maxExpectation) * 100, 100);

  const preparation = stats.career.meetingPreparation;
  const maxPreparation = maxStats.career.meetingPreparation || 100;
  const preparationPct = Math.min((preparation / maxPreparation) * 100, 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
       <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
            <Briefcase size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advisor Status</span>
       </div>
       
       {supervisorState && (
           <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-50">
               <div className="bg-slate-50 p-2 rounded text-center">
                   <div className="flex justify-center mb-1 text-slate-400">
                       <Wallet size={14} />
                   </div>
                   <div className={`font-bold text-sm ${supervisorState.funding < 2000 ? 'text-red-500' : 'text-slate-700'}`}>
                       ${(supervisorState.funding / 1000).toFixed(1)}k
                   </div>
                   <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lab Funding</div>
               </div>
               <div className="bg-slate-50 p-2 rounded text-center">
                   <div className="flex justify-center mb-1 text-slate-400">
                       <TrendingUp size={14} />
                   </div>
                   <div className="font-bold text-sm text-slate-700">
                       {supervisorState.reputation}
                   </div>
                   <div className="text-[10px] text-slate-400 uppercase tracking-wider">Reputation</div>
               </div>
           </div>
       )}

       {/* Expectation / Pressure */}
       <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                    Meeting Pressure
                    {expectationPct > 80 && <AlertCircle size={12} className="text-red-500 animate-pulse" />}
                </span>
                <span className={expectationPct > 80 ? 'text-red-600' : 'text-slate-500'}>
                    {Math.round(expectation)}/{maxExpectation}
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ease-out ${
                        expectationPct > 80 ? 'bg-red-600' : 'bg-red-400'
                    }`} 
                    style={{ width: `${expectationPct}%` }}
                />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>Accumulates weekly</span>
                {expectationPct >= 100 && <span className="text-red-500 font-bold">FORCED MEETING IMMINENT</span>}
            </div>
       </div>

       {/* Preparation */}
       <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Meeting Prep</span>
                <span className="text-slate-500">
                    {Math.round(preparation)}/{maxPreparation}
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
                    style={{ width: `${preparationPct}%` }}
                />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
                Needed to initiate meeting safely
            </div>
       </div>
    </div>
  );
};
