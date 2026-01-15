
import React, { useState } from 'react';
import { db } from '../services/db';
import { Search, Edit3, Trash2, Download, FileText, AlertTriangle } from 'lucide-react';
import { MothEntry, Taxon, formatScientificName } from '../types';

interface RecordListProps {
  onEdit: (taxon: Taxon) => void;
}

const RecordList: React.FC<RecordListProps> = ({ onEdit }) => {
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const entries = db.getEntries();

  const filtered = entries.filter(e => 
    e.taxon_name.toLowerCase().includes(query.toLowerCase()) ||
    e.taxon_chinese.toLowerCase().includes(query.toLowerCase()) ||
    e.notes.toLowerCase().includes(query.toLowerCase()) ||
    e.entry_code.includes(query)
  );

  const confirmDelete = (id: string) => {
    db.deleteEntry(id);
    setDeletingId(null);
    window.location.reload();
  };

  const exportCSV = () => {
    // 1. 定義排序規則：科 -> 屬 -> 種 -> 亞種 (忽略大小寫字典序)
    const sortedEntries = [...entries].sort((a, b) => {
      const familyA = (a.family || '').toLowerCase();
      const familyB = (b.family || '').toLowerCase();
      if (familyA !== familyB) return familyA.localeCompare(familyB);

      const genusA = (a.genus || '').toLowerCase();
      const genusB = (b.genus || '').toLowerCase();
      if (genusA !== genusB) return genusA.localeCompare(genusB);

      const speciesA = (a.species || '').toLowerCase();
      const speciesB = (b.species || '').toLowerCase();
      if (speciesA !== speciesB) return speciesA.localeCompare(speciesB);

      const subA = (a.subspecies || '').toLowerCase();
      const subB = (b.subspecies || '').toLowerCase();
      return subA.localeCompare(subB);
    });

    // 2. 準備 CSV 表頭
    const headers = [
      'Entry Code', 'Family', 'Genus', 'Species', 'Subspecies', 'Scientific Name', 'Chinese Name', 'Rank', 
      'Stages Seen', 
      'egg_photos_count', 'larva_photos_count', 'pupa_photos_count', 'adult_photos_count',
      'has_male_adult', 'has_female_adult',
      'iNaturalist Links', 'Last Updated'
    ];

    // 3. 轉換每一列 (計算方式：包含該階段所有照片，不論性別)
    const rows = sortedEntries.map(e => {
      // 見過階段統計
      const stages = (['egg', 'larva', 'pupa', 'adult'] as const);
      const seenStages = stages.filter(s => e.stages[s].length > 0)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join('|');
      
      // A) 四個階段照片數量 (數字)
      const counts = stages.map(s => {
        return e.stages[s].reduce((acc, set) => acc + set.photos.length, 0);
      });

      // B) 成蟲雌雄是否存在 (Yes/No)
      // 判定規則：存在至少一張成蟲照片 gender = 'male'/'female'
      const hasMale = e.stages.adult.some(set => set.photos.some(p => p.gender === 'male')) ? 'Yes' : 'No';
      const hasFemale = e.stages.adult.some(set => set.photos.some(p => p.gender === 'female')) ? 'Yes' : 'No';

      // 匯總所有 iNaturalist 連結
      const links = stages.flatMap(s => e.stages[s].map(set => set.inat_link))
        .filter(link => link && link.trim() !== '')
        .join(' ; ');

      return [
        e.entry_code,
        e.family,
        e.genus,
        e.species || '',
        e.subspecies || '',
        `"${formatScientificName(e.genus, e.species, e.subspecies)}"`,
        `"${e.taxon_chinese}"`,
        e.taxon_rank,
        seenStages,
        counts[0], // egg_photos_count
        counts[1], // larva_photos_count
        counts[2], // pupa_photos_count
        counts[3], // adult_photos_count
        hasMale,
        hasFemale,
        `"${links}"`,
        new Date(e.lastUpdated).toISOString()
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `moth_checklist_v2_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-5 text-slate-300" size={24} />
          <input 
            type="text" 
            placeholder="搜尋名錄 (名稱或編號)..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-slate-100 shadow-sm text-lg"
          />
        </div>
        <button 
          onClick={exportCSV}
          className="px-8 py-5 bg-white border border-slate-200 text-slate-700 rounded-[2rem] font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm w-full md:w-auto"
        >
          <Download size={20} /> 匯出 CSV (依分類排序)
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 text-slate-400">目前尚無資料</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((entry) => {
            const allPhotos = Object.values(entry.stages).flat().flatMap(s => s.photos);
            const coverPhoto = allPhotos[0];

            return (
              <div key={entry.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col">
                <div className="flex gap-6 p-6">
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                    {coverPhoto ? (
                      <img src={coverPhoto.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px] font-bold">無照片</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-slate-800 text-xl truncate leading-tight">{entry.taxon_chinese || '無中文名'}</h4>
                        <p className="text-xs text-slate-400 italic truncate">
                          {formatScientificName(entry.genus, entry.species, entry.subspecies)}
                        </p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 rounded-md tracking-widest">{entry.taxon_rank}</span>
                    </div>
                    
                    <div className="text-[10px] font-bold text-slate-400 mb-3 space-x-2 tracking-widest">
                       <span>科: {entry.family}</span>
                       <span>屬: {entry.genus}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['egg', 'larva', 'pupa', 'adult'] as const).map(s => (
                        <span key={s} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          entry.stages[s].length > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'
                        }`}>
                          {s === 'egg' ? '卵' : s === 'larva' ? '幼蟲' : s === 'pupa' ? '蛹' : '成蟲'}: {entry.stages[s].reduce((acc, set) => acc + set.photos.length, 0)}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                       <FileText size={10} /> 編號: {entry.entry_code}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100 mt-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    更新日期: {new Date(entry.lastUpdated).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onEdit({ 
                        taxon_id: entry.id, 
                        scientific_name: entry.taxon_name, 
                        chinese_name: entry.taxon_chinese,
                        rank: entry.taxon_rank,
                        family: entry.family,
                        genus: entry.genus,
                        species: entry.species,
                        subspecies: entry.subspecies
                      })}
                      className="p-3 bg-white text-slate-700 rounded-2xl shadow-sm hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 text-xs font-black"
                    >
                      <Edit3 size={16} /> 編輯
                    </button>
                    <button 
                      onClick={() => setDeletingId(entry.id)}
                      className="p-3 bg-white text-slate-300 hover:text-red-600 rounded-2xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">確定刪除此紀錄？</h3>
            <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">此動作無法復原。系統會移除物種名錄資料，但不會刪除 Google Drive 上的照片檔案。</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => confirmDelete(deletingId)}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all"
              >
                確定刪除
              </button>
              <button 
                onClick={() => setDeletingId(null)}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordList;
