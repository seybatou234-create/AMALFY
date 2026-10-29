import React, { useRef, useState } from 'react';
import { Upload, Camera, Plus, Trash2, Star, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface MultiImageFileInputProps {
  label: string;
  helperText?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  required?: boolean;
  className?: string;
  categoryHint?: 'market' | 'real-estate' | 'service';
}

export const MultiImageFileInput: React.FC<MultiImageFileInputProps> = ({
  label,
  helperText,
  images,
  onChange,
  maxImages = 8,
  required = false,
  className = '',
  categoryHint = 'market'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(fileList);
    
    // Filter valid image types
    const validImageFiles = filesArray.filter((file) => file.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      setErrorMessage('Veuillez sélectionner des fichiers image valides (JPG, PNG, WEBP).');
      return;
    }

    if (images.length + validImageFiles.length > maxImages) {
      setErrorMessage(`Vous pouvez ajouter jusqu'à ${maxImages} photos maximum pour cette annonce.`);
    }

    const filesToRead = validImageFiles.slice(0, Math.max(0, maxImages - images.length));
    if (filesToRead.length === 0) return;

    setIsProcessing(true);
    let loadedCount = 0;
    const newResults: string[] = [];

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          newResults.push(result);
        }
        loadedCount++;
        if (loadedCount === filesToRead.length) {
          onChange([...images, ...newResults]);
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === filesToRead.length) {
          if (newResults.length > 0) {
            onChange([...images, ...newResults]);
          }
          setIsProcessing(false);
          setErrorMessage('Certaines photos n’ont pas pu être lues.');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input so the same files can be picked again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetMain = (indexToMain: number) => {
    if (indexToMain === 0) return;
    const target = images[indexToMain];
    const rest = images.filter((_, idx) => idx !== indexToMain);
    onChange([target, ...rest]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Quick Preset Sample Packs for testing
  const presetPacks: Record<string, { label: string; urls: string[] }> = {
    smartphone: {
      label: 'Pack Smartphone (4 photos)',
      urls: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
      ]
    },
    voiture: {
      label: 'Pack Véhicule (4 photos)',
      urls: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
      ]
    },
    villa: {
      label: 'Pack Immobilier (4 photos)',
      urls: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
      ]
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {helperText && <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>}
        </div>

        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {images.length} / {maxImages} photo{images.length > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
              >
                Tout effacer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* When no images uploaded yet: large primary dropzone */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center space-y-2.5 ${
            isDragging
              ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
              : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/30'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            {isProcessing ? (
              <Upload className="w-6 h-6 animate-bounce" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800">
              Cliquez ou glissez plusieurs photos de votre vente ici
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sélectionnez jusqu'à {maxImages} images (JPG, PNG, WEBP) depuis votre galerie ou appareil photo
            </p>
          </div>

          <div className="pt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Sélectionner des photos</span>
          </div>
        </div>
      ) : (
        /* Image gallery grid when at least 1 image is present */
        <div className="space-y-2.5">
          <div className="p-2.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {images.map((imgUrl, index) => {
                const isMain = index === 0;
                return (
                  <div
                    key={index}
                    className={`group relative rounded-xl overflow-hidden aspect-square border-2 bg-slate-900 transition-all ${
                      isMain ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay badges and action buttons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-90 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                      {/* Top row: badge + delete */}
                      <div className="flex items-center justify-between">
                        {isMain ? (
                          <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Principale</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                            #{index + 1}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(index);
                          }}
                          className="p-1 rounded-md bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-xs"
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Bottom action: Set as main if not already */}
                      {!isMain && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetMain(index);
                          }}
                          className="w-full py-1 rounded-md bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
                        >
                          <Star className="w-3 h-3 text-amber-500" />
                          <span>Mettre en 1ère</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add more button tile if under maxImages */}
              {images.length < maxImages && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/40 aspect-square flex flex-col items-center justify-center cursor-pointer p-2 text-center transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-1">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">Ajouter</span>
                  <span className="text-[9px] text-slate-400">+{maxImages - images.length} max</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>La photo avec le badge <strong>« Principale »</strong> s'affichera en couverture dans les résultats de recherche. Cliquez sur « Mettre en 1ère » pour la modifier.</span>
          </p>
        </div>
      )}

      {/* Error banner if any */}
      {errorMessage && (
        <p className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
          {errorMessage}
        </p>
      )}

      {/* Quick Demo Previews */}
      <div className="pt-1">
        <span className="text-[10px] text-slate-400 block mb-1 font-medium">
          Ou charger une série de photos de démonstration :
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(presetPacks).map(([key, pack]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange(pack.urls)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:border-amber-500 hover:text-amber-800 transition-colors shadow-2xs"
            >
              + {pack.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
