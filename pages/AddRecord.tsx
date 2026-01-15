
import React, { useState, useEffect } from 'react';
import { Taxon, Photo, BiodiversityRecord } from '../types';
import TaxonSearch from '../components/TaxonSearch';
import PhotoUploader from '../components/PhotoUploader';
import { db } from '../services/db';
import { Calendar, MapPin, Tag, FileText, CheckCircle2, Info, Camera, Link, ArrowLeft } from 'lucide-react';

interface AddRecordProps {
  onNavigate: (tab: string) => void;
  editRecord?: BiodiversityRecord | null;
}

const AddRecord: React.FC<AddRecordProps> = ({ onNavigate, editRecord }) => {
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(null);
  const [inatLink, setInatLink] = useState('');
  const [stage, setStage] = useState<BiodiversityRecord['stage']>('unknown');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editRecord) {
      // Set values for editing
      setSelectedTaxon({
        taxon_id: editRecord.taxon_id,
        scientific_name: editRecord.taxon_name,
        chinese_name: editRecord.taxon_chinese,
        rank: editRecord.taxon_rank,
        path: editRecord.taxon_path,
        family: '', // These aren't fully needed for selection state
        subfamily: '',
        genus: '',
        species_epithet: ''
      });
      setInatLink(editRecord.inat_link || '');
      setStage(editRecord.stage);
      setNotes(editRecord.notes || '');
      setPhotos(editRecord.photos || []);
    }
  }, [editRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaxon) return;

    const record: BiodiversityRecord = {
      id: editRecord ? editRecord.id : Math.random().toString(36).substr(2, 9),
      taxon_id: selectedTaxon.taxon_id,
      taxon_name: selectedTaxon.scientific_name,
      taxon_chinese: selectedTaxon.chinese_name,
      taxon_rank: selectedTaxon.rank,
      taxon_path: selectedTaxon.path,
      inat_link: inatLink,
      stage,
      notes,
      photos,
      createdAt: editRecord ? editRecord.createdAt : Date.now()
    };

    if (editRecord) {
      db.updateRecord(record);
    } else {
      db.saveRecord(record);
    }
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{editRecord ? '更新成功' : '紀錄已存檔'}</h2>
        <p className="text-slate-500 mb-8">成功更新 {selectedTaxon?.chinese_name || selectedTaxon?.scientific_name} 的名錄資料</p>
        <div className="space-y-3">
          <button 
            onClick={() => onNavigate('list')}
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg"
          >
            返回紀錄列表
          </button>
          {!editRecord && (
            <button 
              onClick={() => {
                setSaved(false);
                setSelectedTaxon(null);
                setInatLink('');
                setPhotos([]);
                setNotes('');
              }}
              className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              繼續新增紀錄
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-4">
        {editRecord && (
          <button 
            type="button" 
            onClick={() => onNavigate('list')}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold"
          >
            <ArrowLeft size={20} /> 返回列表
          </button>
        )}
      </div>

      <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <Tag size={20} />
          <h3 className="font-bold">物種分類</h3>
        </div>
        
        <TaxonSearch onSelect={setSelectedTaxon} />
        
        {selectedTaxon && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4 animate-in slide-in-from-top-2">
            <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center text-emerald-700 shrink-0 font-bold">
              {selectedTaxon.rank[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900 text-lg">
                {selectedTaxon.chinese_name || '無中文名'}
              </div>
              <div className="text-slate-600 italic text-sm mb-1">{selectedTaxon.scientific_name}</div>
              <div className="text-xs text-slate-500 bg-white/50 px-2 py-1 rounded inline-block border border-emerald-100">
                階層: {selectedTaxon.path}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <Link size={20} />
          <h3 className="font-bold">iNaturalist 連結</h3>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">整筆紀錄連結 (Observation Link)</label>
          <input 
            type="url" 
            value={inatLink} 
            onChange={e => setInatLink(e.target.value)}
            placeholder="https://www.inaturalist.org/observations/..."
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <Info size={20} />
          <h3 className="font-bold">狀態階段</h3>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">觀察階段</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(['unknown', 'egg', 'larva', 'pupa', 'adult'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  stage === s 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                {s === 'egg' ? '卵' : s === 'larva' ? '幼蟲' : s === 'pupa' ? '蛹' : s === 'adult' ? '成蟲' : '不詳'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <Camera size={20} />
          <h3 className="font-bold">照片紀錄 (可個別綁定連結)</h3>
        </div>
        <PhotoUploader photos={photos} setPhotos={setPhotos} />
      </section>

      <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <FileText size={20} />
          <h3 className="font-bold">備註筆記</h3>
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="關於此觀察的其他說明..."
          rows={3}
          className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </section>

      <div className="pt-4 sticky bottom-24 md:bottom-4">
        <button
          type="submit"
          disabled={!selectedTaxon}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-2"
        >
          {editRecord ? '儲存更新' : '確認儲存'}
        </button>
      </div>
    </form>
  );
};

export default AddRecord;
