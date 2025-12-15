import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

export const LogPanel: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-64 md:h-96">
      <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
        <h3 className="serif font-bold text-slate-800">Academic Log</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 && (
          <p className="text-slate-400 text-sm text-center italic mt-10">Your academic journey begins...</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className={`text-sm p-3 rounded-lg border-l-4 ${
            log.type === 'danger' ? 'bg-red-50 border-red-500 text-red-900' :
            log.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
            log.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-900' :
            'bg-slate-50 border-slate-400 text-slate-700'
          }`}>
            <span className="font-bold mr-2 text-xs uppercase opacity-70">Week {log.turn}</span>
            {log.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};