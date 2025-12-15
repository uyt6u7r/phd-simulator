
import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { 
  Activity, DollarSign, Zap, Smile, Heart, 
  Brain, Clock, BookOpen, PenTool, TestTube, 
  BarChart, Projector, UserCheck, Star, Sparkles, Target, Shield,
  MessageCircle, Briefcase
} from 'lucide-react';

interface StatsBarProps {
  stats: PlayerStats;
  maxStats: PlayerStats;
  currentRent: number; // New Prop
}

const VISUAL_MAX = 100; // Soft cap for visualization purposes

const StatRow = ({ 
  icon: Icon, 
  label, 
  value, 
  max, 
  colorClass, 
  isCurrency = false,
  hideMaxLabel = false
}: { 
  icon: any, 
  label: string, 
  value: number, 
  max?: number, 
  colorClass: string,
  isCurrency?: boolean,
  hideMaxLabel?: boolean
}) => {
  // If max is provided, use it for percentage. If not, default to 100% (or handle segments elsewhere if needed)
  const effectiveMax = max || 100;
  const percentage = Math.min((value / effectiveMax) * 100, 100);
  
  return (
    <div className="flex items-center gap-2 text-sm w-full">
      <div className={`p-1.5 rounded-md bg-slate-100 text-slate-500`}>
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
          <span>{label}</span>
          <span>
            {isCurrency ? `$${value}` : value}
            {max && !hideMaxLabel ? `/${max}` : ''}
          </span>
        </div>
        {max ? (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
              style={{ width: `${percentage}%` }}
            />
          </div>
        ) : (
           /* Fallback for cases without max (though we are moving away from this for consistency) */
           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden flex gap-0.5">
             {[...Array(Math.min(10, Math.ceil(value / 10)))].map((_, i) => (
                <div key={i} className={`h-full flex-1 ${colorClass} opacity-80`} />
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ label, expanded, onClick }: { label: string, expanded: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider py-2 hover:text-indigo-600 transition-colors"
  >
    {label}
    <span>{expanded ? '−' : '+'}</span>
  </button>
);

export const StatsBar: React.FC<StatsBarProps> = ({ stats, maxStats, currentRent }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    physio: true,
    talents: true,
    skills: true,
    career: true
  });

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Top Level Resources */}
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-600 font-bold text-sm">
                    <Zap size={16} className="text-yellow-500 fill-yellow-500" /> Energy
                </div>
                <div className="text-2xl font-black text-slate-800">{Math.round(stats.energy)}<span className="text-sm text-slate-400 font-normal">/{maxStats.energy}</span></div>
                <div className="h-2 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div 
                        className="h-full bg-yellow-400 transition-all duration-300" 
                        style={{ width: `${(stats.energy / maxStats.energy) * 100}%` }} 
                    />
                </div>
            </div>
             <div className="col-span-1 bg-slate-50 p-3 rounded-lg border border-slate-100 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2 text-slate-600 font-bold text-sm">
                    <DollarSign size={16} className="text-green-600" /> Funds
                </div>
                <div className={`text-2xl font-black ${stats.funds < 200 ? 'text-red-500' : 'text-slate-800'}`}>${Math.round(stats.funds)}</div>
                 <div className="text-xs text-slate-400 mt-2 flex justify-between items-center">
                    <span>Rent due weekly</span>
                    <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-bold">-${currentRent}</span>
                 </div>
            </div>
        </div>

        {/* Physiological */}
        <div>
            <SectionHeader label="Physiological" expanded={expanded.physio} onClick={() => toggle('physio')} />
            {expanded.physio && (
                <div className="space-y-3 mt-1 pl-1">
                    <StatRow icon={Heart} label="Health" value={stats.physiological.health} max={maxStats.physiological.health} colorClass="bg-rose-500" />
                    <StatRow icon={Activity} label="Stress" value={stats.physiological.stress} max={maxStats.physiological.stress} colorClass={stats.physiological.stress > 80 ? "bg-red-600" : "bg-orange-400"} />
                    <StatRow icon={Smile} label="Sanity" value={stats.physiological.sanity} max={maxStats.physiological.sanity} colorClass="bg-purple-500" />
                </div>
            )}
        </div>

        {/* Talents */}
        <div>
            <SectionHeader label="Talents" expanded={expanded.talents} onClick={() => toggle('talents')} />
            {expanded.talents && (
                <div className="space-y-3 mt-1 pl-1">
                    <StatRow 
                      icon={Sparkles} label="Creativity" value={stats.talents.creativity} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-fuchsia-500" 
                    />
                    <StatRow 
                      icon={Target} label="Focus" value={stats.talents.focus} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-violet-600" 
                    />
                    <StatRow 
                      icon={Brain} label="Logic" value={stats.talents.logic} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-cyan-600" 
                    />
                    <StatRow 
                      icon={Shield} label="Resilience" value={stats.talents.resilience} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-emerald-500" 
                    />
                </div>
            )}
        </div>

        {/* Skills */}
        <div>
            <SectionHeader label="Skills" expanded={expanded.skills} onClick={() => toggle('skills')} />
            {expanded.skills && (
                <div className="space-y-3 mt-1 pl-1">
                    <StatRow 
                      icon={Clock} label="Time Mgmt" value={stats.skills.timeManagement} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-amber-500" 
                    />
                    <StatRow 
                      icon={BookOpen} label="Reading" value={stats.skills.reading} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-sky-500" 
                    />
                    <StatRow 
                      icon={PenTool} label="Writing" value={stats.skills.writing} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-indigo-500" 
                    />
                    <StatRow 
                      icon={TestTube} label="Experiment" value={stats.skills.experiment} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-lime-600" 
                    />
                    <StatRow 
                      icon={BarChart} label="Analysis" value={stats.skills.analysis} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-rose-500" 
                    />
                    <StatRow 
                      icon={Projector} label="Presentation" value={stats.skills.presentation} 
                      max={VISUAL_MAX} hideMaxLabel={true} colorClass="bg-orange-500" 
                    />
                </div>
            )}
        </div>

         {/* Social & Career */}
        <div>
            <SectionHeader label="Career & Social" expanded={expanded.career} onClick={() => toggle('career')} />
            {expanded.career && (
                <div className="space-y-3 mt-1 pl-1">
                    <StatRow icon={UserCheck} label="Advisor Rel." value={stats.career.supervisorRel} max={maxStats.career.supervisorRel} colorClass="bg-green-500" />
                    <StatRow icon={Star} label="Reputation" value={stats.career.reputation} max={500} hideMaxLabel={true} colorClass="bg-yellow-500" />
                </div>
            )}
        </div>

    </div>
  );
};
