
import React, { useRef, useState } from 'react';
import { Camera, X, ImageIcon, Loader2, Link } from 'lucide-react';
import { Photo } from '../types';

interface PhotoUploaderProps {
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos, setPhotos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotos: Photo[] = [];

    for (const file of Array.from(files)) {
      const localUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = localUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      newPhotos.push({
        id: Math.random().toString(36).substr(2, 9),
        url: localUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        width: img.width,
        height: img.height,
        inat_link: '', // Default empty iNat link
        drive_link: `https://drive.google.com/simulate/${file.name}`
      });
    }

    setPhotos([...photos, ...newPhotos]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const updatePhotoLink = (id: string, link: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, inat_link: link } : p));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:ring-2 hover:ring-emerald-500">
            <div className="relative aspect-video">
              <img 
                src={photo.url} 
                alt={photo.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <button 
                  onClick={() => removePhoto(photo.id)}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Link size={14} className="text-slate-400" />
                <input 
                  type="text"
                  placeholder="iNaturalist 照片連結..."
                  value={photo.inat_link || ''}
                  onChange={(e) => updatePhotoLink(photo.id, e.target.value)}
                  className="w-full text-xs p-1.5 bg-slate-50 border border-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
              <div className="text-[10px] text-slate-400 truncate flex justify-between">
                <span>{photo.width}x{photo.height}</span>
                <span>{(photo.size / 1024).toFixed(1)}KB</span>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all text-slate-400 group disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Camera size={24} className="text-emerald-500" />
              </div>
              <span className="text-xs font-medium">新增照片</span>
            </>
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default PhotoUploader;
