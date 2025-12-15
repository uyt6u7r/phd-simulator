
import React from 'react';
import { ActiveProject, ResearchIdea } from '../types';
import { Microscope, Send, Lightbulb, Sparkles, BookOpen, Eye, AlertCircle, DollarSign, Zap, PenTool } from 'lucide-react';

interface ProjectCardProps {
  project: ActiveProject | null;
  availableIdeas: ResearchIdea[];
  onInspectIdea: (idea: ResearchIdea) => void;
  onResearch: () => void;
  onFinalize: () => void; // Renamed from onWrite
  canResearch: boolean;
  canWrite: boolean;
  loading: boolean;
  researchCostEnergy?: number;
  // funds cost removed
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  availableIdeas,
  onInspectIdea,
  onResearch, 
  onFinalize,
  canResearch,
  canWrite,
  loading,
  researchCostEnergy = 15
}) => {
  // Active Project Mode
  if (project) {
    const isRevision = project.status === 'REVISION';
    const targetProgress = isRevision ? project.revisionRequirement || 100 : 100;
    const currentProgress = project.progress;
    const progressPct = Math.min(100, (currentProgress / targetProgress) * 100);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isRevision ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
          <div className="mb-4">
            <span className={`text-xs font-bold tracking-wider uppercase ${isRevision ? 'text-amber-600' : 'text-indigo-600'}`}>
                {isRevision ? `Revising for ${project.targetJournal?.name}` : 'Current Project'}
            </span>
            <h3 className="serif text-xl font-bold text-slate-900 leading-tight mt-1">{project.title}</h3>
            <p className="text-sm text-slate-500 mt-2 italic">"{project.description}"</p>
          </div>
    
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{isRevision ? 'Revision Progress' : 'Research Progress'}</span>
                <span className="text-slate-500">
                    {Math.round(currentProgress)}{isRevision ? `/${targetProgress}` : '%'}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isRevision ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              {!isRevision && project.failureCount > 0 && (
                  <div className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={10} /> {project.failureCount} Setback{project.failureCount > 1 ? 's' : ''} encountered
                  </div>
              )}
            </div>
    
            <div className="flex gap-3 items-end">
              {progressPct < 100 ? (
                <div className="w-full">
                    <button 
                    onClick={onResearch}
                    disabled={!canResearch || loading}
                    className={`w-full text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors relative disabled:bg-slate-300 disabled:cursor-not-allowed ${
                        isRevision ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                    >
                        {isRevision ? <PenTool size={18} /> : <Microscope size={18} />}
                        {isRevision ? 'Conduct Revision' : 'Conduct Research'}
                    </button>
                    <div className="flex justify-between mt-2 text-xs text-slate-500 px-1">
                        <div className="flex gap-2">
                             <span className="flex items-center gap-0.5"><Zap size={10} /> {researchCostEnergy} Energy</span>
                        </div>
                        {/* Risk Indicator based on Novelty vs Feasibility (Scale 1-100) */}
                        {!isRevision && (project.novelty > project.feasibility + 20) && (
                            <span className="flex items-center gap-1 text-orange-500 font-bold" title="High Novelty increases risk of failure">
                                <AlertCircle size={10} /> High Risk
                            </span>
                        )}
                    </div>
                </div>
              ) : (
                 <button 
                  onClick={onFinalize}
                  disabled={!canWrite || loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors animate-pulse"
                >
                  <Send size={18} />
                  {isRevision ? 'Submit Revisions' : 'Finalize Findings'}
                </button>
              )}
            </div>
          </div>
        </div>
      );
  }

  // Idea Notebook Mode (No Active Project)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
       <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="serif font-bold text-slate-800 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-500" />
                Idea Notebook
            </h3>
            <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white rounded border">
                {availableIdeas.length} {availableIdeas.length === 1 ? 'Idea' : 'Ideas'}
            </span>
       </div>
       
       <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {availableIdeas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <BookOpen size={48} className="mb-4 opacity-50" />
                    <p className="font-medium text-slate-500 mb-1">Writer's Block?</p>
                    <p className="text-sm">
                        You need inspiration to start a new project. 
                        Try <strong>Reading Papers</strong>, <strong>Attending Seminars</strong>, or <strong>Meeting your Advisor</strong> to generate new ideas.
                    </p>
                </div>
            ) : (
                availableIdeas.map(idea => (
                    <div key={idea.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-all bg-slate-50/50 group">
                        <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Sparkles size={10} /> {idea.origin}
                             </span>
                             <div className="flex gap-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                    Diff: {idea.difficulty}/100
                                </span>
                             </div>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1 leading-tight">{idea.title}</h4>
                        <p className="text-xs text-slate-600 italic mb-4">"{idea.description}"</p>
                        
                        <button
                            onClick={() => onInspectIdea(idea)}
                            disabled={loading}
                            className="w-full py-2 bg-white border border-indigo-200 text-indigo-700 font-semibold rounded text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <Eye size={16} /> Inspect Idea
                        </button>
                    </div>
                ))
            )}
       </div>
    </div>
  );
};
