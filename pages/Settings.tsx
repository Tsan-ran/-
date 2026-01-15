
import React, { useState } from 'react';
import { Database, ShieldCheck, HardDrive, Info, FolderOpen, Save } from 'lucide-react';
import { db } from '../services/db';

const Settings: React.FC = () => {
  const currentSettings = db.getSettings();
  const [rootId, setRootId] = useState(currentSettings.driveRootId);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    db.saveSettings({ driveRootId: rootId });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <FolderOpen size={24} className="text-emerald-500" /> Google Drive 設定
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          請設定預設的上傳目標資料夾。系統會在此資料夾下自動建立「科/屬/種/階段」的分類樹。
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">根資料夾 ID (ROOT FOLDER ID)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={rootId}
                onChange={e => setRootId(e.target.value)}
                placeholder="例如: 1abc2def3ghi..."
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-sm"
              />
              <button 
                onClick={handleSave}
                className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
              >
                <Save size={18} /> 儲存
              </button>
            </div>
          </div>
          {saved && <p className="text-emerald-500 text-xs font-bold animate-pulse">設定已成功儲存</p>}
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2">
          <Database size={24} className="text-slate-400" /> 儲存機制說明
        </h3>
        
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
              <HardDrive size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">分類自動化</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                系統上傳照片時會檢查物種資料。若無明確屬/種名，會自動歸類到該層級的 <strong>__UNSORTED__</strong> 資料夾中，保持雲端空間整潔。
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">檔案永久儲存</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                您的原始照片儲存於 Google Drive。即使清除瀏覽器快取或從名錄中移除紀錄，雲端檔案依然會被保留。
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
              <Info size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">安全性與權限</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                目前系統採用模擬 API 流程。在實際部署時，需確保您的 Google 帳號已授權 Drive API 存取權限。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
