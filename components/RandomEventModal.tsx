

import React from 'react';
import { RandomEvent, ActionEffect } from '../types';
import { AlertTriangle, PartyPopper, Info, ArrowRight, DollarSign, Zap, Heart, Activity, Brain, BookOpen, UserCheck, Star } from 'lucide-react';

interface RandomEventModalProps {
  event: RandomEvent;
  onClose: () => void;
}

export const RandomEventModal: React.FC<RandomEventModalProps> = ({ event, onClose }) => {
  
  const getIcon = () => {
    switch (event.type) {
        case 'good': return <PartyPopper size={48} className="text-emerald-500" />;
        case 'bad': return <AlertTriangle size={48} className="text-red-500" />;
        default: return <Info size={48} className="text-blue-500" />;
    }
  };

  const getColorClass = () => {
      switch (event.type) {
          case 'good': return 'border-emerald-500 bg-emerald-50';
          case 'bad': return 'border-red-500 bg-red-50';
          default: return 'border-blue-500 bg-blue-50';
      }
  };

  const getButtonClass = () => {
      switch (event.type) {
          case 'good': return 'bg-emerald-600 hover:bg-emerald-700';
          case 'bad': return 'bg-red-600 hover:bg-red-700';
          default: return 'bg-blue-600 hover:bg-blue-700';
      }
  };

  // Helper to flatten effects for display
  const renderEffects = (effect: ActionEffect, special?: any) => {
    const items: React.ReactNode[] = [];

    const addBadge = (icon: any, label: string, val: number, isBad: boolean) => {
        items.push(
            <div key={label} className={`flex items-center justify-between p-2 rounded bg-white border ${isBad ? 'border-red-100' : 'border-emerald-100'}`}>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className={`font-bold ${val > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {val > 0 ? '+' : ''}{val}
                </span>
            </div>
        );
    };

    if (effect.energy) addBadge(<Zap size={14}/>, "Energy", effect.energy, effect.energy < 0);
    if (effect.funds) addBadge(<DollarSign size={14}/>, "Funds", effect.funds, effect.funds < 0);
    
    // Physiological
    if (effect.physiological?.stress) addBadge(<Activity size={14}/>, "Stress", effect.physiological.stress, effect.physiological.stress > 0); // Stress going up is bad
    if (effect.physiological?.sanity) addBadge(<Brain size={14}/>, "Sanity", effect.physiological.sanity, effect.physiological.sanity < 0);
    if (effect.physiological?.health) addBadge(<Heart size={14}/>, "Health", effect.physiological.health, effect.physiological.health < 0);

    // Career
    if (effect.career?.reputation) addBadge(<Star size={14}/>, "Reputation", effect.career.reputation, effect.career.reputation < 0);
    if (effect.career?.supervisorRel) addBadge(<UserCheck size={14}/>, "Advisor Rel", effect.career.supervisorRel, effect.career.supervisorRel < 0);

    // Skills/Talents (Generic)
    const checkGroup = (group: any) => {
        if(!group) return;
        Object.entries(group).forEach(([k, v]) => {
            addBadge(<BookOpen size={14}/>, k.charAt(0).toUpperCase() + k.slice(1), v as number, (v as number) < 0);
        });
    };
    checkGroup(effect.talents);
    checkGroup(effect.skills);

    // Special
    if (special?.rentChange) {
        items.push(
            <div key="rent" className="flex items-center justify-between p-2 rounded bg-white border border-amber-100">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                    <DollarSign size={14}/>
                    <span>Weekly Rent</span>
                </div>
                <span className="font-bold text-red-600">
                    +{special.rentChange}
                </span>
            </div>
        );
    }

    return items;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-t-8 ${getColorClass().split(' ')[0]}`}>
        
        <div className={`p-6 text-center border-b border-slate-100 ${getColorClass().split(' ')[1]}`}>
           <div className="flex justify-center mb-4 bg-white w-20 h-20 rounded-full items-center mx-auto shadow-sm">
               {getIcon()}
           </div>
           <div className="uppercase tracking-widest text-xs font-bold opacity-60 mb-1">Random Event</div>
           <h2 className="serif text-2xl font-bold text-slate-900">{event.title}</h2>
        </div>

        <div className="p-6">
            <p className="text-slate-600 text-center mb-6 italic">"{event.description}"</p>
            
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Consequences</p>
                <div className="grid grid-cols-1 gap-2">
                    {renderEffects(event.effect, event.specialEffect)}
                </div>
            </div>

            <button 
                onClick={onClose}
                className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${getButtonClass()}`}
            >
                Okay <ArrowRight size={18} />
            </button>
        </div>

      </div>
    </div>
  );
};
