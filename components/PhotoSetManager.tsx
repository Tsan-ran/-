
import React, { useRef, useState } from 'react';
import { Camera, X, Link as LinkIcon, Trash2, Loader2, FolderCheck } from 'lucide-react';
import { PhotoSet, PhotoItem, Gender, MothStage, MothEntry } from '../types';
import { db } from '../services/db';
import { ensureFolderPath, uploadFileToDrive } from '../services/drive';

interface PhotoSetManagerProps {
  stage: MothStage;
  set: PhotoSet;
  entry: MothEntry; // 需要傳入 entry 以獲取分類資訊
  onUpdate: (updatedSet: PhotoSet) => void;
  onDelete: () => void;
  setIndex: number;
}

const PhotoSetManager: React.FC<PhotoSetManagerProps> = ({ stage, set, entry, onUpdate, onDelete, setIndex }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const settings = db.getSettings();
    if (!settings.driveRootId) {
      setUploadError('請先至「儲存說明」設定 Google Drive 根資料夾 ID');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // 1. 確保 Drive 資料夾樹存在
      const { folderId, displayPath } = await ensureFolderPath(settings.driveRootId, entry, stage);

      const newPhotos: PhotoItem[] = [];
      for (const file of Array.from(files)) {
        // 2. 上傳到對應資料夾
        const driveUrl = await uploadFileToDrive(file, folderId);
        
        // 3. 獲取本地預覽 (實際應用中可用 driveUrl)
        const localUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = localUrl;
        await new Promise(r => img.onload = r);

        newPhotos.push({
          id: Math.random().toString(36).substr(2, 9),
          url: localUrl, // 本地預覽
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          gender: stage === 'adult' ? 'uncertain' : undefined,
          drive_folder_id: folderId,
          drive_path_display: displayPath
        });
      }

      onUpdate({ ...set, photos: [...set.photos, ...newPhotos] });
    } catch (err: any) {
      setUploadError(err.message || '上傳失敗');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    const confirmed = window.confirm('確定要從名錄中移除這張照片嗎？系統紀錄將會消失，但不會刪除您 Google Drive 上的原始圖檔。');
    if (confirmed) {
      onUpdate({ ...set, photos: set.photos.filter(p => p.id !== photoId) });
    }
  };

  const updatePhotoGender = (photoId: string, gender: Gender) => {
    onUpdate({
      ...set,
      photos: set.photos.map(p => p.id === photoId ? { ...p, gender } : p)
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm relative group/set">
      <div className="flex items-center justify-between">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">照片組 #{setIndex + 1}</h5>
        <button 
          onClick={onDelete}
          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          title="刪除整組"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {set.photos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group/photo flex flex-col">
            <div className="relative aspect-video bg-slate-100">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <button 
                onClick={() => removePhoto(photo.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover/photo:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {photo.drive_path_display && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md flex items-center gap-1">
                  <FolderCheck size={10} className="text-emerald-400" />
                  <span className="text-[8px] text-white font-medium truncate max-w-[100px]">{photo.drive_path_display}</span>
                </div>
              )}
            </div>
            
            {stage === 'adult' && (
              <div className="p-2 flex gap-1 border-t border-slate-100">
                {(['uncertain', 'male', 'female'] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => updatePhotoGender(photo.id, g)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                      photo.gender === g 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'male' ? '雄' : g === 'female' ? '雌' : '不確定'}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-400 transition-all text-slate-400 disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="animate-spin text-emerald-500" /> : <Camera size={24} />}
          <span className="text-xs font-bold">{isUploading ? '建立目錄中...' : '上傳照片'}</span>
        </button>
      </div>

      {uploadError && (
        <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg">{uploadError}</p>
      )}

      <div className="pt-2 border-t border-slate-200">
        <div className="relative">
          <LinkIcon className="absolute left-3 top-3 text-slate-300" size={14} />
          <input 
            type="url" 
            placeholder="iNaturalist 觀察連結..." 
            value={set.inat_link}
            onChange={e => onUpdate({ ...set, inat_link: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none"
          />
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleUpload} multiple accept="image/*" className="hidden" />
    </div>
  );
};

export default PhotoSetManager;
