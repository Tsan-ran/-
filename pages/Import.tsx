
import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Clock, Database, Loader2 } from 'lucide-react';
import { parseTaiColCSV } from '../services/csv';
import { db } from '../services/db';
import { ImportRecord } from '../types';

const Import: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const history = db.getImportHistory();

  const handleFiles = useCallback((files: FileList) => {
    const selectedFile = files[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      setStatus('idle');
      setError('');
    } else {
      setError('請提供有效的 CSV 檔案');
    }
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus('parsing');
    try {
      const text = await file.text();
      const taxons = await parseTaiColCSV(text);
      
      if (taxons.length > 0) {
        db.saveTaxonIndex(taxons);
        db.addImportRecord({
          id: Math.random().toString(36).substr(2, 9),
          filename: file.name,
          timestamp: Date.now(),
          count: taxons.length,
          type: 'taxonomy_csv'
        });
        setCount(taxons.length);
        setStatus('success');
      } else {
        setError('CSV 中找不到有效名 (accepted) 的資料。');
        setStatus('error');
      }
    } catch (err) {
      setError('讀取檔案失敗。');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Upload size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">匯入分類 CSV</h3>
          <p className="text-slate-500">上傳 TaiCOL CSV 以重建搜尋索引。注意：此操作會覆蓋現有的物種名錄索引。</p>
        </div>

        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <input 
            type="file" 
            onChange={(e) => e.target.files && handleFiles(e.target.files)} 
            accept=".csv" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
          
          <div className="flex flex-col items-center">
            {file ? (
              <>
                <FileText className="text-blue-500 mb-2" size={48} />
                <span className="font-bold text-slate-800">{file.name}</span>
                <span className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
              </>
            ) : (
              <>
                <Upload className="text-slate-300 mb-4" size={48} />
                <p className="font-bold text-slate-600">將檔案拖曳至此處，或點擊選取</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">僅支援 .csv 格式</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-medium">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleImport}
            disabled={!file || status === 'parsing'}
            className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            {status === 'parsing' ? <Loader2 className="animate-spin" /> : <Database size={20} />}
            執行匯入
          </button>
          {status === 'success' && (
            <button
              onClick={() => onNavigate('add')}
              className="flex-1 py-4 px-6 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
            >
              前往新增紀錄 <CheckCircle size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" /> 匯入紀錄
        </h4>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">目前無歷史紀錄</p>
          ) : (
            history.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{rec.filename}</p>
                    <p className="text-[10px] text-slate-400">{new Date(rec.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{rec.count}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">有效筆數</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Import;
