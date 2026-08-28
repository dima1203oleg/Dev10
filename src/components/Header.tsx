import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      <div>
        <h1 className="text-xl font-bold text-white">ТЕНДЕР ШІ</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Операційна система державних закупівель</p>
      </div>
      
      <div className="flex-1 max-w-2xl px-8">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Пошук: Капремонт лікарень Київ від 10 млн грн"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-slate-400">
        <Bell className="w-5 h-5 cursor-pointer hover:text-white" />
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          В МЕРЕЖІ
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};
