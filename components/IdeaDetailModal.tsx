
import React from 'react';
import { ResearchIdea, PlayerStats } from '../types';
import { Lightbulb, CheckCircle, X, Sparkles, Target, Settings, DollarSign, Activity } from 'lucide-react';

interface IdeaDetailModalProps {
  idea: ResearchIdea;
  onConfirm: () => void;
  onClose: () => void;
  cost: { energy: number, physiological?: { stress: number } };
  stats: PlayerStats;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({ idea, onConfirm, onClose, cost, stats }) => {
  const canAfford = stats.energy >= cost.energy;

  const RatingRow = ({ label, value, icon: Icon, colorClass }: { label: string, value: number, icon: any, colorClass: string }) => (
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${colorClass} bg-opacity-20`}>
            <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div className="flex-1">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                <span>{label}</span>
                <span>{value}/100</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${colorClass.replace('bg-opacity-20', '')}`} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
            <div className="flex gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                    <Lightbulb size={32} />
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{idea.origin}</div>
                    <h2 className="serif text-xl font-bold text-slate-900 leading-tight">{idea.title}</h2>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            <p className="text-slate-600 italic">"{idea.description}"</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RatingRow label="Potential" value={idea.potential} icon={Sparkles} colorClass="bg-yellow-500" />
                <RatingRow label="Novelty" value={idea.novelty} icon={Target} colorClass="bg-fuchsia-500" />
                <RatingRow label="Feasibility" value={idea.feasibility} icon={CheckCircle} colorClass="bg-emerald-500" />
                <RatingRow label="Attraction" value={idea.attraction} icon={Activity} colorClass="bg-rose-500" />
                <RatingRow label="Resources Req." value={idea.resources} icon={DollarSign} colorClass="bg-slate-600" />
                <RatingRow label="Difficulty" value={idea.difficulty} icon={Settings} colorClass="bg-orange-500" />
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mt-2">
                <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Development Cost</div>
                <div className="flex gap-4 text-sm font-medium">
                    <span className={canAfford ? 'text-slate-700' : 'text-red-600 font-bold'}>
                        {cost.energy} Energy
                    </span>
                    <span className="text-slate-700">
                        {cost.physiological?.stress} Stress
                    </span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
             <button 
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
                Keep in Notebook
            </button>
            <button 
                onClick={onConfirm}
                disabled={!canAfford}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex justify-center items-center gap-2"
            >
                {canAfford ? 'Develop Project' : 'Not Enough Energy'}
            </button>
        </div>

      </div>
    </div>
  );
};