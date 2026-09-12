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
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls && data.urls.length > 0) {
        if (multiple && onChangeMultiple) {
          onChangeMultiple([...values, ...data.urls]);
        } else if (!multiple && onChangeSingle) {
          onChangeSingle(data.urls[0]);
        }
      } else {
        setErrorMsg(data.error || 'Failed to upload image(s)');
      }
    } catch {
      setErrorMsg('Upload error occurred');
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
              <div key={idx} className="relative group rounded-2xl overflow-hidden border border-[#dce7dc] bg-white h-28 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
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
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/10 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#183a35] truncate">{value}</p>
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
                  <span>Uploading Image...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#e8f0e8] flex items-center justify-center text-[#28745e] mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#183a35]">Click to Upload Image or Drag & Drop</p>
                  <p className="text-[10px] text-[#58706a] mt-0.5">Supports PNG, JPG, WEBP (Max 10MB)</p>
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
