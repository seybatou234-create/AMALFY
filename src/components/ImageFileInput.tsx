import React, { useRef, useState } from 'react';
import { Upload, Camera, Check, X, RefreshCw, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface ImageFileInputProps {
  label: string;
  helperText?: string;
  value: string;
  onChange: (dataUrl: string) => void;
  aspectRatio?: 'square' | 'card' | 'banner';
  placeholderTitle?: string;
  placeholderDesc?: string;
  required?: boolean;
  className?: string;
}

export const ImageFileInput: React.FC<ImageFileInputProps> = ({
  label,
  helperText,
  value,
  onChange,
  aspectRatio = 'square',
  placeholderTitle = 'Cliquez ou glissez une photo ici',
  placeholderDesc = 'PNG, JPG, WEBP jusqu’à 10 Mo (depuis votre téléphone ou ordinateur)',
  required = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Erreur lors de la lecture du fichier image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClasses = {
    square: 'aspect-square max-w-[200px] sm:max-w-[220px]',
    card: 'aspect-[3/2] w-full max-w-[340px]',
    banner: 'aspect-[16/9] w-full'
  }[aspectRatio];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
            <Check className="w-3 h-3" />
            <span>Image chargée</span>
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Interactive Dropzone / Preview Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center p-3 text-center ${aspectClasses} ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
            : value
            ? 'border-slate-200 bg-slate-900/5 hover:border-emerald-400'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-emerald-400'
        }`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Aperçu document"
              className="w-full h-full object-cover rounded-xl shadow-xs"
            />
            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <span className="text-[11px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                <span>Remplacer la photo</span>
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <X className="w-3 h-3" />
                <span>Supprimer</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                {placeholderTitle}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug max-w-[240px]">
                {placeholderDesc}
              </p>
            </div>
            <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <Upload className="w-3 h-3" />
              <span>Parcourir les fichiers</span>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
