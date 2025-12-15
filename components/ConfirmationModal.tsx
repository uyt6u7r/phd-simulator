
import React, { useEffect, useState } from 'react';
import { PlayerStats, MandatoryTask } from '../types';
import { ClipboardCheck, UserCheck, Star, AlertTriangle, CheckCircle, XCircle, FileWarning } from 'lucide-react';

interface ConfirmationModalProps {
  stats: PlayerStats;
  task: MandatoryTask;
  citations: number;
  onResult: (success: boolean) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ stats, task, citations, onResult }) => {
  const [step, setStep] = useState(0);

  // Criteria 1: Absolute Progress Requirement
  // Floating point precision can be tricky, using a small epsilon or Math.round
  const progressPercent = (task.progress / task.totalEffort) * 100;
  const isComplete = progressPercent >= 99.5; 

  // Scoring Logic
  // Base Score for completing the report
  const BASE_SCORE = 40; 
  
  // Supervisor Component (Max ~50)
  const supervisorScore = stats.career.supervisorRel * 0.5;
  
  // Impact Component (Reputation + Citations)
  const impactScore = (stats.career.reputation * 0.2) + (citations * 3);

  const totalScore = BASE_SCORE + supervisorScore + impactScore;
  const PASS_THRESHOLD = 75;

  const passed = isComplete && totalScore >= PASS_THRESHOLD;

  // Animation sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <h2 className="serif text-2xl font-bold">Confirmation Review</h2>
          <p className="text-slate-400 text-sm mt-1">The committee is evaluating your candidature...</p>
        </div>

        <div className="p-8 space-y-6">
          
          {/* Step 1: Report Progress Check */}
          <div className={`flex items-center justify-between transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-3">
              {isComplete ? <ClipboardCheck className="text-emerald-600" size={24} /> : <FileWarning className="text-red-500" size={24} />}
              <div>
                <div className="font-bold text-slate-800">Report Submission</div>
                <div className="text-xs text-slate-500">Must be 100% complete</div>
              </div>
            </div>
            <div className="text-right">
              {isComplete ? (
                 <div className="font-mono font-bold text-lg text-emerald-600">COMPLETE</div>
              ) : (
                 <div className="font-mono font-bold text-lg text-red-600">INCOMPLETE</div>
              )}
              <div className="text-xs text-slate-400">{Math.floor(progressPercent)}% / 100%</div>
            </div>
          </div>

          {/* If Incomplete, show Fail immediately at step 2, else show scores */}
          {(!isComplete && step >= 2) ? (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700 text-sm font-medium animate-in zoom-in">
                   <AlertTriangle className="mx-auto mb-2" size={24} />
                   Automatic Failure: You did not finish the report in time.
               </div>
          ) : (
            <>
                {/* Step 2: Supervisor Input */}
                <div className={`flex items-center justify-between transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-3">
                    <UserCheck className="text-blue-600" size={24} />
                    <div>
                        <div className="font-bold text-slate-800">Supervisor Support</div>
                        <div className="text-xs text-slate-500">Relation weighted (x0.5)</div>
                    </div>
                    </div>
                    <div className="font-mono font-bold text-lg text-blue-600">
                    +{Math.round(supervisorScore)} pts
                    </div>
                </div>

                {/* Step 3: Academic Impact */}
                <div className={`flex items-center justify-between transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-3">
                    <Star className="text-yellow-500 fill-yellow-500" size={24} />
                    <div>
                        <div className="font-bold text-slate-800">Academic Impact</div>
                        <div className="text-xs text-slate-500">Reputation & Citations</div>
                    </div>
                    </div>
                    <div className="font-mono font-bold text-lg text-yellow-600">
                    +{Math.round(impactScore)} pts
                    </div>
                </div>
            </>
          )}

          <div className="border-t border-slate-200 my-4"></div>

          {/* Step 4: Final Result */}
          {step >= 4 && (
             <div className="text-center animate-in zoom-in duration-300">
               <div className="flex justify-center mb-4">
                 {passed ? (
                   <CheckCircle size={64} className="text-emerald-500" />
                 ) : (
                   <XCircle size={64} className="text-red-500" />
                 )}
               </div>
               
               <h3 className={`text-3xl font-black uppercase tracking-tight mb-2 ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                 {passed ? 'Confirmed' : 'Failed'}
               </h3>
               
               <p className="text-slate-600 mb-6">
                 {passed 
                   ? "You have demonstrated sufficient progress and academic potential. Your candidature is confirmed." 
                   : "The committee is not satisfied. Your research output or supervisor support is insufficient."}
               </p>

               {isComplete && (
                    <div className="bg-slate-50 p-3 rounded-lg inline-block mb-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-slate-500 text-sm font-semibold uppercase">Total Score:</span>
                            <span className={`text-2xl font-black ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                {Math.round(totalScore)}
                            </span>
                            <span className="text-slate-400 font-bold">/ {PASS_THRESHOLD}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Base (40) + Supervisor + Impact</div>
                    </div>
               )}

               <button
                 onClick={() => onResult(passed)}
                 className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] ${
                   passed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                 }`}
               >
                 {passed ? 'Continue Journey' : 'Pack Your Bags'}
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
