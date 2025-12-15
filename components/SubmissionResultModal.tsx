
import React from 'react';
import { SubmissionResult, ReviewType, PlayerStats } from '../types';
import { CheckCircle, XCircle, FileText, AlertTriangle, PenTool, MessageSquare, Trash2, ArrowRight, Star, Heart, Activity, UserCheck } from 'lucide-react';

interface SubmissionResultModalProps {
  result: SubmissionResult;
  stats: PlayerStats;
  onClose: () => void;
  onReviewAction: (action: 'REVISE' | 'REBUT' | 'GIVEUP') => void;
}

export const SubmissionResultModal: React.FC<SubmissionResultModalProps> = ({ result, stats, onClose, onReviewAction }) => {
  const isReview = result.status === 'PEER_REVIEW';
  const isAccepted = result.status === 'ACCEPTED';
  const isRejected = result.status === 'REJECTED' || result.status === 'DESK_REJECT';

  // Config for Review Types
  const getReviewConfig = (type: ReviewType) => {
      switch(type) {
          case 'MINOR_REVISION': return { 
              title: "Minor Revisions", 
              color: 'text-amber-600', 
              bg: 'bg-amber-50 border-amber-200',
              reviseDesc: "Fix typos and update a graph.",
              target: "Low Effort"
          };
          case 'MAJOR_REVISION': return { 
              title: "Major Revisions", 
              color: 'text-orange-600', 
              bg: 'bg-orange-50 border-orange-200',
              reviseDesc: "Rewrite the discussion and re-analyze data.",
              target: "Medium Effort"
          };
          case 'RESUBMIT': return { 
              title: "Reject & Resubmit", 
              color: 'text-red-600', 
              bg: 'bg-red-50 border-red-200',
              reviseDesc: "Significant overhaul required.",
              target: "High Effort"
          };
          default: return { title: "Review", color: 'text-slate-600', bg: 'bg-slate-50', reviseDesc: "", target: "" };
      }
  };

  const reviewConfig = result.reviewType ? getReviewConfig(result.reviewType) : null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header Image/Icon */}
        <div className={`p-8 flex justify-center items-center ${
            isAccepted ? 'bg-emerald-50' : 
            isReview ? 'bg-amber-50' : 
            'bg-red-50'
        }`}>
            {isAccepted && <CheckCircle size={80} className="text-emerald-500 animate-bounce" />}
            {isReview && <FileText size={80} className="text-amber-500" />}
            {isRejected && <XCircle size={80} className="text-red-500" />}
        </div>

        <div className="p-6 text-center">
             <div className="uppercase tracking-widest text-xs font-bold opacity-50 mb-2">
                 Journal Decision: {result.journal.name}
             </div>
             
             <h2 className={`serif text-3xl font-black mb-2 ${
                 isAccepted ? 'text-emerald-600' :
                 isReview ? 'text-amber-600' :
                 'text-red-600'
             }`}>
                 {isAccepted ? 'ACCEPTED' : isReview ? reviewConfig?.title : result.status === 'DESK_REJECT' ? 'DESK REJECT' : 'REJECTED'}
             </h2>
             
             <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left relative">
                 <div className="absolute top-0 left-0 -mt-2 ml-4 bg-slate-200 text-[10px] font-bold px-2 rounded text-slate-500 uppercase">Reviewer #2</div>
                 <p className="text-slate-700 italic text-sm mt-2">"{result.message}"</p>
             </div>

             {/* ACCEPTANCE REWARDS */}
             {isAccepted && result.rewards && (
                 <div className="mb-6 space-y-2 animate-in slide-in-from-bottom-2 fade-in">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rewards</div>
                     <div className="grid grid-cols-2 gap-2">
                         <div className="bg-yellow-50 border border-yellow-100 p-2 rounded flex items-center gap-2 text-sm text-yellow-800">
                             <Star size={14} /> +{result.rewards.reputation} Reputation
                         </div>
                         <div className="bg-blue-50 border border-blue-100 p-2 rounded flex items-center gap-2 text-sm text-blue-800">
                             <UserCheck size={14} /> +{result.rewards.relationship} Advisor Rel
                         </div>
                         <div className="bg-emerald-50 border border-emerald-100 p-2 rounded flex items-center gap-2 text-sm text-emerald-800">
                             <Activity size={14} /> -{result.rewards.stressRef} Stress
                         </div>
                          <div className="bg-purple-50 border border-purple-100 p-2 rounded flex items-center gap-2 text-sm text-purple-800">
                             <Heart size={14} /> +{result.rewards.sanity} Sanity
                         </div>
                     </div>
                     <div className="bg-slate-50 border border-slate-100 p-2 rounded text-xs text-slate-500">
                         Meeting Pressure reduced by {result.rewards.pressureRef}
                     </div>
                 </div>
             )}

             {/* ACTIONS FOR PEER REVIEW */}
             {isReview && reviewConfig && (
                 <div className="space-y-3">
                     <p className="text-xs text-slate-500 mb-2">How do you want to proceed?</p>
                     
                     {/* Revise Button */}
                     <button
                        onClick={() => onReviewAction('REVISE')}
                        className="w-full text-left p-3 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-between group"
                     >
                         <div className="flex items-center gap-3">
                             <div className="bg-indigo-200 p-2 rounded-lg text-indigo-700">
                                 <PenTool size={18} />
                             </div>
                             <div>
                                 <div className="font-bold text-indigo-900 text-sm">Start Revisions</div>
                                 <div className="text-xs text-indigo-600 opacity-80">{reviewConfig.reviseDesc}</div>
                             </div>
                         </div>
                         <div className="text-xs font-bold px-2 py-1 rounded bg-white text-indigo-600 border border-indigo-200">
                             Enters Revision Phase
                         </div>
                     </button>

                     {/* Rebut Button */}
                     <button
                        onClick={() => onReviewAction('REBUT')}
                        disabled={stats.energy < 10}
                        className="w-full text-left p-3 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between group disabled:opacity-50"
                     >
                         <div className="flex items-center gap-3">
                             <div className="bg-amber-200 p-2 rounded-lg text-amber-700">
                                 <MessageSquare size={18} />
                             </div>
                             <div>
                                 <div className="font-bold text-amber-900 text-sm">Argue / Rebut</div>
                                 <div className="text-xs text-amber-600 opacity-80">Risk immediate rejection. High Stress.</div>
                             </div>
                         </div>
                         <div className="text-xs font-bold bg-white text-amber-600 px-2 py-1 rounded">
                             -10 En / +Stress
                         </div>
                     </button>

                     {/* Give Up */}
                     <button
                        onClick={() => onReviewAction('GIVEUP')}
                        className="w-full text-center py-2 text-xs text-slate-400 hover:text-red-500 font-medium flex items-center justify-center gap-1 mt-2"
                     >
                         <Trash2 size={12} /> Withdraw Paper
                     </button>
                 </div>
             )}

             {/* CLOSE BUTTON FOR FINAL STATES */}
             {!isReview && (
                 <button 
                    onClick={onClose}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                 >
                    Continue <ArrowRight size={18} />
                 </button>
             )}
        </div>

      </div>
    </div>
  );
};
