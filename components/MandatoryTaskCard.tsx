
import React from 'react';
import { MandatoryTask } from '../types';
import { FileText, AlertCircle, Clock, Zap } from 'lucide-react';

interface MandatoryTaskCardProps {
  task: MandatoryTask;
  turn: number;
  energy: number;
  onWorkTask: () => void;
  loading: boolean;
}

export const MandatoryTaskCard: React.FC<MandatoryTaskCardProps> = ({ 
  task, 
  turn,
  energy,
  onWorkTask,
  loading
}) => {
  const weeksLeft = task.deadline - turn;
  const isUrgent = weeksLeft < 8;

  return (
    <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden ${
        isUrgent ? 'bg-amber-50 border-amber-300' : 'bg-orange-50 border-orange-200'
    }`}>
        {/* Status Stripe */}
        <div className={`absolute top-0 left-0 w-1 h-full ${isUrgent ? 'bg-red-500' : 'bg-orange-500'}`}></div>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-orange-900">
                <AlertCircle size={20} />
                <span className="text-xs font-bold tracking-wider uppercase">Mandatory Requirement</span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
                isUrgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-orange-200 text-orange-800'
            }`}>
                <Clock size={14} />
                <span>Due in {weeksLeft} Weeks</span>
            </div>
        </div>
        
        <div className="mb-6">
            <h3 className="serif text-xl font-bold text-slate-900 leading-tight">{task.title}</h3>
            <p className="text-sm text-slate-700 mt-2">{task.description}</p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-orange-900">Completion Progress</span>
                    <span className="text-orange-800 font-bold">{Math.round((task.progress / task.totalEffort) * 100)}%</span>
                </div>
                <div className="h-4 w-full bg-orange-200/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (task.progress / task.totalEffort) * 100)}%` }}
                    ></div>
                </div>
            </div>

            <button 
                onClick={onWorkTask}
                disabled={loading || energy <= 0}
                className="w-full group bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <FileText size={18} />
                    <span>Work on Report</span>
                </div>
                <span className="text-orange-200 text-sm ml-auto border-l border-orange-500 pl-3 flex items-center gap-1">
                    <Zap size={14} className="fill-orange-200" />
                    All Energy
                </span>
            </button>
            <p className="text-xs text-center text-orange-800 opacity-80 mt-1">
                Uses <strong>all remaining energy</strong> for maximum progress.
            </p>
        </div>
    </div>
  );
};
