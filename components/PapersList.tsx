
import React from 'react';
import { Paper } from '../types';

interface PapersListProps {
  papers: Paper[];
}

export const PapersList: React.FC<PapersListProps> = ({ papers }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="serif text-lg font-bold text-slate-800 border-b pb-2 mb-4">Published Papers</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {papers.length === 0 && <p className="text-sm text-slate-400 italic">No publications yet.</p>}
        {papers.map(paper => (
          <div key={paper.id} className={`p-3 rounded border text-sm ${paper.accepted ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100 opacity-70'}`}>
            <div className="flex justify-between items-start gap-2">
                <p className="font-bold text-slate-800 leading-tight">{paper.title}</p>
                {paper.accepted && paper.journalName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 text-right max-w-[40%] truncate">
                        {paper.journalName}
                    </span>
                )}
            </div>
            
            <div className="flex justify-between mt-2 text-xs items-center">
              <span className={paper.accepted ? "text-indigo-600 font-medium" : "text-red-600 font-medium"}>
                {paper.accepted 
                    ? `Published (IF: ${paper.impactFactor ?? 'N/A'})` 
                    : "Rejected"}
              </span>
              {paper.accepted && <span className="text-slate-500 font-mono">{paper.citations} cit.</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
