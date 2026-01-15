
import React, { useState, useEffect } from 'react';
import { Taxon, MothEntry, MothStage, PhotoSet, formatScientificName } from '../types';
import TaxonSearch from '../components/TaxonSearch';
import PhotoSetManager from '../components/PhotoSetManager';
import { db } from '../services/db';
import { Tag, FileText, CheckCircle2, PlusCircle, LayoutGrid, Loader2 } from 'lucide-react';

const EntryEditor: React.FC<{ onNavigate: (tab: string) => void, initialTaxon?: Taxon | null }> = ({ onNavigate, initialTaxon }) => {
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(initialTaxon || null);
  const [entry, setEntry] = useState<MothEntry | null>(null);
  const [activeStage, setActiveStage] = useState<MothStage>('adult');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    if (selectedTaxon) {
      const existing = db.getEntryByTaxonId(selectedTaxon.taxon_id);
      if (existing) {
        setEntry(existing);
      } else {
        const newEntry: MothEntry = {
          id: selectedTaxon.taxon_id,
          entry_code: '', 
          taxon_name: selectedTaxon.scientific_name,
          taxon_chinese: selectedTaxon.chinese_name,
          taxon_rank: selectedTaxon.rank,
          family: selectedTaxon.family,
          genus: selectedTaxon.genus,
          species: selectedTaxon.species,
          subspecies: selectedTaxon.subspecies,
          notes: '',
          stages: { egg: [], larva: [], pupa: [], adult: [] },
          lastUpdated: Date.now()
        };
        setEntry(newEntry);
      }
    } else {
      setEntry(null);
    }
  }, [selectedTaxon]);

  const handleSave = () => {
    if (!entry) return;
    setIsSaving(true);
    db.saveEntry(entry);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const addPhotoSet = (stage: MothStage) => {
    if (!entry) return;
    const newSet: PhotoSet = {
      id: Math.random().toString(36).substr(2, 9),
      inat_link: '',
      photos: []
    };
    
    const updatedStages = { ...entry.stages };
    updatedStages[stage] = [...updatedStages[stage], newSet];
    const updatedEntry = { ...entry, stages: updatedStages, lastUpdated: Date.now() };
    
    setEntry(updatedEntry);
    db.saveEntry(updatedEntry);
  };

  const updatePhotoSet = (stage: MothStage, index: number, updatedSet: PhotoSet) => {
    if (!entry) return;
    const updatedStages = { ...entry.stages };
    updatedStages[stage] = [...updatedStages[stage]];
    updatedStages[stage][index] = updatedSet;
    const updatedEntry = { ...entry, stages: updatedStages, lastUpdated: Date.now() };
    setEntry(updatedEntry);
  };

  const deletePhotoSet = (stage: MothStage, setId: string) => {
    if (!entry) return;
    
    const targetSet = entry.stages[stage].find(s => s.id === setId);
    if (!targetSet) return;

    let confirmText = '確定要刪除這個照片組嗎？此操作無法復原。';
    if (targetSet.photos.length > 0) {
      confirmText += '\n此照片組內的照片在系統中也會一併移除；Google Drive 上的檔案不會被刪除。';
    }

    const confirmed = window.confirm(confirmText);
    
    if (confirmed) {
      const updatedStages = JSON.parse(JSON.stringify(entry.stages));
      updatedStages[stage] = updatedStages[stage].filter((s: any) => s.id !== setId);
      const updatedEntry = { ...entry, stages: updatedStages, lastUpdated: Date.now() };
      setEntry(updatedEntry);
      db.saveEntry(updatedEntry);
      
      setDeleteMsg('照片組已成功刪除');
      setTimeout(() => setDeleteMsg(''), 3000);
    }
  };

  const stageTabs: { id: MothStage, label: string }[] = [
    { id: 'egg', label: '卵' },
    { id: 'larva', label: '幼蟲' },
    { id: 'pupa', label: '蛹' },
    { id: 'adult', label: '成蟲' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 mb-6 font-bold">
          <Tag size={20} />
          <span>物種名錄檢索</span>
        </div>
        <TaxonSearch onSelect={setSelectedTaxon} />
        {!selectedTaxon && (
          <div className="mt-6 p-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400">
            請搜尋欲新增或編輯的物種名稱...
          </div>
        )}
      </section>

      {entry && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{entry.taxon_rank}</span>
                <span className="text-slate-400 text-xs font-medium">編號: {entry.entry_code || '新紀錄'}</span>
              </div>
              <h2 className="text-3xl font-black mb-1">{entry.taxon_chinese || '無中文名'}</h2>
              <p className="text-emerald-400 italic font-medium">
                {formatScientificName(entry.genus, entry.species, entry.subspecies)}
              </p>
              <div className="flex gap-4 mt-4 text-[10px] font-bold tracking-widest text-slate-500">
                 <div>科: {entry.family}</div>
                 <div>屬: {entry.genus}</div>
                 {entry.species && <div>種: {entry.species}</div>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                儲存更新
              </button>
              {showSuccess && <span className="text-emerald-400 text-xs font-bold animate-pulse">資料已更新成功</span>}
              {deleteMsg && <span className="text-red-400 text-xs font-bold">{deleteMsg}</span>}
            </div>
          </div>

          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {stageTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStage(tab.id)}
                  className={`flex-1 py-5 text-sm font-black transition-all flex flex-col items-center gap-1 border-b-2 ${
                    activeStage === tab.id 
                      ? 'bg-white border-emerald-500 text-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    entry.stages[tab.id].length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {entry.stages[tab.id].length}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  {stageTabs.find(t => t.id === activeStage)?.label} 階段管理
                </h4>
                <button 
                  onClick={() => addPhotoSet(activeStage)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                >
                  <PlusCircle size={18} /> 新增照片組
                </button>
              </div>

              {entry.stages[activeStage].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400">
                  <LayoutGrid size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">目前尚無紀錄</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {entry.stages[activeStage].map((set, idx) => (
                    <PhotoSetManager 
                      key={set.id}
                      stage={activeStage}
                      set={set}
                      entry={entry} // 傳遞 entry 供 Drive 資料夾定位使用
                      setIndex={idx}
                      onUpdate={(updated) => updatePhotoSet(activeStage, idx, updated)}
                      onDelete={() => deletePhotoSet(activeStage, set.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-6 font-bold">
              <FileText size={20} />
              <span>補充筆記</span>
            </div>
            <textarea
              value={entry.notes}
              onChange={e => setEntry({ ...entry, notes: e.target.value })}
              placeholder="關於此物種的觀察筆記..."
              rows={5}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            />
          </section>
        </div>
      )}
    </div>
  );
};

export default EntryEditor;
