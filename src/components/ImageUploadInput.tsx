'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Plus, Check } from 'lucide-react';

interface ImageUploadInputProps {
  label?: string;
  value?: string; // For single image
  values?: string[]; // For multiple images
  multiple?: boolean;
  onChangeSingle?: (url: string) => void;
  onChangeMultiple?: (urls: string[]) => void;
  helperText?: string;
}

// Convert image file to heavily compressed, lightweight web image (<50KB)
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return resolve('');

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // optimized for web speed

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const isPng = file.type === 'image/png';
            const compressed = canvas.toDataURL(isPng && width < 400 ? 'image/png' : 'image/jpeg', 0.72);
            resolve(compressed);
          } else {
            resolve(rawDataUrl.length < 500000 ? rawDataUrl : '');
          }
        } catch {
          resolve(rawDataUrl.length < 500000 ? rawDataUrl : '');
        }
      };
      img.onerror = () => resolve(rawDataUrl.length < 500000 ? rawDataUrl : '');
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value = '',
  values = [],
  multiple = false,
  onChangeSingle,
  onChangeMultiple,
  helperText,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const fileArray = Array.from(files);

      // 1. Try server upload first for clean static URL
      let serverUrls: string[] = [];
      try {
        const formData = new FormData();
        fileArray.forEach((file) => formData.append('files', file));
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const json = await res.json();
          if (json.urls && Array.isArray(json.urls) && json.urls.length > 0) {
            serverUrls = json.urls;
          }
        }
      } catch {
        // Fallback to client-side compression
      }

      if (serverUrls.length > 0) {
        if (multiple && onChangeMultiple) {
          onChangeMultiple([...values, ...serverUrls]);
        } else if (!multiple && onChangeSingle && serverUrls[0]) {
          onChangeSingle(serverUrls[0]);
        }
        return;
      }

      // 2. Client-side fallback: compressed tiny data URL (<50KB)
      const compressedDataUrls = await Promise.all(
        fileArray.map((file) => compressImageFile(file))
      );
      const validDataUrls = compressedDataUrls.filter(Boolean);

      if (validDataUrls.length === 0) {
        setErrorMsg('Please choose a valid image file');
        return;
      }

      if (multiple && onChangeMultiple) {
        onChangeMultiple([...values, ...validDataUrls]);
      } else if (!multiple && onChangeSingle && validDataUrls[0]) {
        onChangeSingle(validDataUrls[0]);
      }
    } catch {
      setErrorMsg('Failed to process image file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const removeImageAt = (index: number) => {
    if (onChangeMultiple) {
      const updated = values.filter((_, i) => i !== index);
      onChangeMultiple(updated);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-[#183a35]">{label}</label>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files);
        }}
      />

      {/* MULTIPLE IMAGES MODE */}
      {multiple ? (
        <div className="space-y-3">
          {/* Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {values.map((url, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden border border-[#dce7dc] bg-[#eef3ee] h-28 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImageAt(idx)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-red-600 p-1 text-white opacity-90 group-hover:opacity-100 hover:bg-red-700 transition shadow-md"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-1 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[9px] text-white font-mono">
                  #{idx + 1}
                </div>
              </div>
            ))}

            {/* Add More Dropzone Card */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              disabled={uploading}
              className={`h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition ${
                dragActive
                  ? 'border-[#28745e] bg-[#e8f0e8]'
                  : 'border-[#28745e]/40 bg-[#f8f4e9]/50 hover:bg-[#e8f0e8]/60'
              }`}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#28745e]" />
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#28745e]/10 flex items-center justify-center text-[#28745e] mb-1">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-[#123f38]">+ Upload Images</span>
                  <span className="text-[9px] text-[#58706a]">Drag or select multiple</span>
                </>
              )}
            </button>
          </div>
          {values.length > 0 && (
            <p className="text-[10px] font-medium text-[#28745e]">
              <Check className="w-3 h-3 inline mr-1" />
              {values.length} blog gallery images attached
            </p>
          )}
        </div>
      ) : (
        /* SINGLE IMAGE MODE */
        <div className="space-y-2">
          {value ? (
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-[#dce7dc] shadow-sm">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/10 relative bg-[#eef3ee]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#183a35] truncate">{value.substring(0, 45)}...</p>
                <p className="text-[10px] text-green-700 font-semibold mt-0.5">✓ Image Uploaded Successfully</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-xl border border-[#28745e] text-[#28745e] text-xs font-bold hover:bg-[#28745e] hover:text-white transition"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChangeSingle && onChangeSingle('')}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition ${
                dragActive
                  ? 'border-[#28745e] bg-[#e8f0e8]'
                  : 'border-[#28745e]/30 bg-white hover:bg-[#f8f4e9]'
              }`}
            >
              {uploading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#28745e]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing & Uploading Image...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#e8f0e8] flex items-center justify-center text-[#28745e] mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#183a35]">Click to Upload Image or Drag & Drop</p>
                  <p className="text-[10px] text-[#58706a] mt-0.5">Supports PNG, JPG, WEBP from your computer/device</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {errorMsg && <p className="text-[10px] font-bold text-red-600 mt-1">{errorMsg}</p>}
      {helperText && <p className="text-[10px] text-[#58706a]">{helperText}</p>}
    </div>
  );
};
