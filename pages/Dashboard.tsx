
import React from 'react';
import { db } from '../services/db';
import { Database, Camera, ExternalLink, List, LayoutGrid } from 'lucide-react';

const Dashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const entries = db.getEntries();
  const index = db.getTaxonIndex();

  const totalPhotoSets = entries.reduce((acc, entry) => {
    return acc + 
      entry.stages.egg.length + 
      entry.stages.larva.length + 
      entry.stages.pupa.length + 
      entry.stages.adult.length;
  }, 0);

  const stats = [
    { label: '名錄物種數', value: entries.length, icon: <List size={24} className="text-blue-500" />, color: 'bg-blue-50' },
    { label: '觀察紀錄組數', value: totalPhotoSets, icon: <LayoutGrid size={24} className="text-emerald-500" />, color: 'bg-emerald-50' },
    { label: 'TAICOL 索引數', value: index.length, icon: <Database size={24} className="text-amber-500" />, color: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">{stat.icon}</div>
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</div>
            <div className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-800">最近增修物種</h3>
          <button onClick={() => onNavigate('list')} className="text-emerald-600 text-sm font-bold hover:underline">查看完整列表</button>
        </div>
        
        {entries.length === 0 ? (
          <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem]">
            名錄目前為空
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 rounded-3xl transition-colors border border-transparent hover:border-slate-100 group">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0 shadow-sm">
                  {entry.stages.adult[0]?.photos[0]?.url ? (
                    <img src={entry.stages.adult[0].photos[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Camera size={20} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 truncate text-lg group-hover:text-emerald-600 transition-colors">{entry.taxon_chinese || entry.taxon_name}</h4>
                  <p className="text-xs text-slate-500 italic truncate mb-2">{entry.taxon_name}</p>
                  <div className="flex items-center gap-2">
                    {(['egg', 'larva', 'pupa', 'adult'] as const).map(s => (
                       <span key={s} className={`w-2 h-2 rounded-full ${entry.stages[s].length > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                    <span className="text-[10px] text-slate-400 font-bold ml-2">
                      {new Date(entry.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
