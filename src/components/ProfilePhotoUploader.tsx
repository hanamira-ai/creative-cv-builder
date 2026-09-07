import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Camera, Check, RefreshCw } from 'lucide-react';

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string;
  candidateName: string;
  onPhotoUploaded: (dataUrl: string) => void;
  onPhotoRemoved: () => void;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentPhotoUrl,
  candidateName,
  onPhotoUploaded,
  onPhotoRemoved,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('File harus berformat gambar (JPG, PNG, WebP, atau SVG).');
      return;
    }

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal adalah 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onPhotoUploaded(result);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2500);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-200 no-print">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Thumbnail & Status */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt={candidateName}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/80 shadow-lg shadow-amber-500/10 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-amber-400 shrink-0">
                {candidateName.charAt(0) || 'U'}
              </div>
            )}
            <button
              onClick={triggerFileInput}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              title="Ganti Foto"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Foto Profil Dokumen
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Format Lingkaran (Circle)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Foto akan ditampilkan secara simetris dalam bentuk lingkaran pada sidebar CV A4.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {currentPhotoUrl && (
            <button
              type="button"
              onClick={onPhotoRemoved}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
              title="Hapus foto profil dan gunakan avatar inisial nama"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}

          <button
            type="button"
            onClick={triggerFileInput}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-amber-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Foto Baru</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-photo-file-input"
      />

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`mt-3.5 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.005]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ImageIcon className={`w-4 h-4 ${isDragging ? 'text-amber-400' : 'text-slate-500'}`} />
          {isDragging ? (
            <span className="text-amber-400 font-semibold">Lepaskan file gambar di sini...</span>
          ) : (
            <span>
              Tarik & letakkan foto di sini, atau <strong className="text-amber-400 font-semibold underline underline-offset-2">pilih dari perangkat</strong> (PNG, JPG, WebP)
            </span>
          )}
        </div>
      </div>

      {/* Success / Error alerts */}
      {uploadSuccess && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Foto profil berhasil diperbarui dan diterapkan ke dokumen A4!</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 text-xs text-rose-400 font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
