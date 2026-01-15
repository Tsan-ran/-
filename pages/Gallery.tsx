
import React, { useMemo } from 'react';
import { db } from '../services/db';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import { MothEntry, formatScientificName } from '../types';

const Gallery: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const entries = db.getEntries();

  const entriesWithAdults = useMemo(() => {
    return entries.filter(e => e.stages.adult.length > 0);
  }, [entries]);

  // 取得特定性別的照片（無 fallback）
  const getSpecificGenderPhoto = (entry: MothEntry, gender: 'male' | 'female') => {
    for (const set of entry.stages.adult) {
      const photo = set.photos.find(p => p.gender === gender);
      if (photo) return photo;
    }
    return null;
  };

  // 取得第一張可用照片（不分性別）
  const getFirstAvailablePhoto = (entry: MothEntry) => {
    for (const set of entry.stages.adult) {
      if (set.photos.length > 0) return set.photos[0];
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-2">成蟲相簿統整</h3>
        <p className="text-slate-400 text-sm">若標記有雄/雌性照片將分欄對比。若皆未標記，則僅顯示一張代表照，避免視覺重複。</p>
      </div>

      {entriesWithAdults.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
          <ImageIcon className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 font-medium">目前尚無成蟲照片</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {entriesWithAdults.map((entry) => {
            const malePhoto = getSpecificGenderPhoto(entry, 'male');
            const femalePhoto = getSpecificGenderPhoto(entry, 'female');
            const hasSpecificGenders = malePhoto || femalePhoto;
            const representative = getFirstAvailablePhoto(entry);

            return (
              <div key={entry.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                {/* 照片顯示區塊 */}
                <div className="h-56 bg-slate-50 relative border-b border-slate-50">
                  {hasSpecificGenders ? (
                    // 情況 A: 有標記性別 -> 顯示二分對比視圖
                    <div className="flex h-full">
                      {/* 雄性欄位 */}
                      <div className="flex-1 border-r border-slate-100 relative overflow-hidden">
                        {malePhoto ? (
                          <img src={malePhoto.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="雄性" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-bold bg-slate-50/50">無標記雄蟲</div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-black rounded uppercase tracking-tighter">Male</div>
                      </div>
                      {/* 雌性欄位 */}
                      <div className="flex-1 relative overflow-hidden">
                        {femalePhoto ? (
                          <img src={femalePhoto.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="雌性" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-bold bg-slate-50/50">無標記雌蟲</div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/60 backdrop-blur-md text-white text-[9px] font-black rounded uppercase tracking-tighter">Female</div>
                      </div>
                    </div>
                  ) : (
                    // 情況 B: 皆未標記 -> 顯示單張代表圖（避免重複圖）
                    <div className="w-full h-full relative overflow-hidden">
                      {representative ? (
                        <img src={representative.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="代表照" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-500/40 backdrop-blur-md text-white text-[9px] font-black rounded uppercase tracking-tighter">Unlabeled / General</div>
                    </div>
                  )}
                </div>

                <div className="p-6 relative flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{entry.family}</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg truncate mb-1">{entry.taxon_chinese || '無中文名'}</h4>
                  <p className="text-emerald-500 italic text-[11px] font-medium truncate mb-6">
                    {formatScientificName(entry.genus, entry.species, entry.subspecies)}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider">#{entry.entry_code}</span>
                    <button 
                       onClick={() => onNavigate('list')}
                       className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Gallery;
