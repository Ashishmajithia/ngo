'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UploadCloud, X, Loader2, Plus, Check, Link as LinkIcon, Eye, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageUploadInputProps {
  label?: string;
  value?: string; // For single image
  values?: string[]; // For multiple images
  multiple?: boolean;
  onChangeSingle?: (url: string) => void;
  onChangeMultiple?: (urls: string[]) => void;
  helperText?: string;
}

export { normalizeImageUrl, SafeImage } from './SafeImage';
import { normalizeImageUrl, SafeImage } from './SafeImage';

// Convert image file to heavily compressed, lightweight web image (<80KB)
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return resolve('');

      // Keep 100% original Full HD / 4K resolution directly for normal files (<6MB)
      if (file.size < 6 * 1024 * 1024) {
        return resolve(normalizeImageUrl(rawDataUrl));
      }

      // Only for ultra-huge files (>6MB), maintain crisp 2560px resolution at 0.94 quality
      const maxDim = 2560;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

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
            const compressed = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.94);
            resolve(normalizeImageUrl(compressed));
          } else {
            resolve(normalizeImageUrl(rawDataUrl));
          }
        } catch {
          resolve(normalizeImageUrl(rawDataUrl));
        }
      };
      img.onerror = () => resolve(normalizeImageUrl(rawDataUrl));
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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [singleImgStatus, setSingleImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const fileArray = Array.from(files);

      // 1. Client-side compression first so image is always lightweight (< 80KB)
      const compressedDataUrls = await Promise.all(
        fileArray.map((file) => compressImageFile(file, 1280))
      );
      const validDataUrls = compressedDataUrls.filter(Boolean);

      if (validDataUrls.length === 0) {
        setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }

      // 2. Try uploading to /api/upload
      let finalUrls: string[] = [];
      try {
        const formData = new FormData();
        for (let i = 0; i < fileArray.length; i++) {
          formData.append('files[]', fileArray[i]);
        }
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const json = await res.json();
          const serverUrls = (json.urls && Array.isArray(json.urls) && json.urls.length > 0)
            ? json.urls
            : (json.url ? [json.url] : []);
          
          // Only use server URLs if they actually saved to static /uploads disk
          const diskUrls = serverUrls.filter((u: string) => typeof u === 'string' && u.startsWith('/uploads/'));
          if (diskUrls.length === fileArray.length) {
            finalUrls = diskUrls;
          }
        }
      } catch (uploadErr) {
        console.warn('Server upload warning:', uploadErr);
      }

      // If server could not save to disk (e.g. Vercel read-only filesystem), use the client compressed data URLs!
      if (finalUrls.length === 0) {
        finalUrls = validDataUrls.map(normalizeImageUrl);
      }

      if (multiple && onChangeMultiple) {
        onChangeMultiple([...values, ...finalUrls]);
      } else if (!multiple && onChangeSingle && finalUrls[0]) {
        onChangeSingle(finalUrls[0]);
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

  const handleApplyDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    const clean = normalizeImageUrl(directUrl.trim());
    if (multiple && onChangeMultiple) {
      onChangeMultiple([...values, clean]);
    } else if (!multiple && onChangeSingle) {
      onChangeSingle(clean);
    }
    setDirectUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <label className="block text-xs font-bold text-[#183a35]">{label}</label>}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-[#28745e] hover:underline flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL Input' : 'Paste Image Link / URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <form onSubmit={handleApplyDirectUrl} className="flex gap-2 p-2 rounded-xl bg-[#f8f4e9] border border-[#dce7dc]">
          <input
            type="text"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or /uploads/..."
            className="flex-1 text-xs p-2 rounded-lg border bg-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[#123f38] text-white text-xs font-bold hover:bg-[#28745e] transition"
          >
            Apply URL
          </button>
        </form>
      )}

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
              <div
                key={idx}
                className="relative group rounded-2xl overflow-hidden border border-[#dce7dc] bg-[#eef3ee] h-28 shadow-sm cursor-pointer"
                onClick={() => setPreviewModalUrl(normalizeImageUrl(url))}
                title="Click to view full image"
              >
                <SafeImage
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImageAt(idx);
                  }}
                  className="absolute top-1.5 right-1.5 rounded-full bg-red-600 p-1 text-white opacity-90 group-hover:opacity-100 hover:bg-red-700 transition shadow-md z-20"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-1 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[9px] text-white font-mono z-10">
                  #{idx + 1}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none z-10">
                  <Eye className="w-5 h-5 drop-shadow" />
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
              {values.length} images attached
            </p>
          )}
        </div>
      ) : (
        /* SINGLE IMAGE MODE */
        <div className="space-y-2">
          {value ? (
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-[#dce7dc] shadow-sm">
              <div
                onClick={() => setPreviewModalUrl(normalizeImageUrl(value))}
                className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/10 relative bg-[#eef3ee] cursor-pointer group shadow-xs"
                title="Click to expand high-resolution preview"
              >
                <SafeImage
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onStatusChange={setSingleImgStatus}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-10">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#183a35] truncate">{value.substring(0, 45)}...</p>
                {singleImgStatus === 'loaded' && (
                  <p className="text-[10px] text-green-700 font-semibold mt-0.5 flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    <span>✓ Image Ready & Displaying</span>
                  </p>
                )}
                {singleImgStatus === 'loading' && (
                  <p className="text-[10px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                    <span>Loading image preview...</span>
                  </p>
                )}
                {singleImgStatus === 'error' && (
                  <p className="text-[10px] text-red-600 font-semibold mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span>Image preview failed to load</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(normalizeImageUrl(value))}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                  title="View HD Image"
                >
                  <Eye className="w-4 h-4" />
                </button>
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
                  <span>Compressing & Uploading Image...</span>
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

      {/* Lightbox Modal for HD preview inspection */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#123f38] p-3 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 text-white border-b border-white/10 mb-2">
              <span className="text-xs font-bold text-[#f2ad3b] truncate max-w-md">HD Image Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl flex items-center justify-center bg-black/40 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalUrl}
                alt="Full Preview"
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
