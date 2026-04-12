"use client";

import { useState, useRef } from 'react';

type Props = {
  initialImages: string[];   // 現在の画像URL配列
  name?: string;             // hidden input の name（デフォルト "images"）
  maxImages?: number;
};

export default function ImageManager({ initialImages, name = 'images', maxImages = 5 }: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || 'Upload failed');
    }
    const { url } = await res.json();
    return url as string;
  };

  const handleFiles = async (files: FileList) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`最大${maxImages}枚までです`);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const toUpload = Array.from(files).slice(0, remaining);
      const urls = await Promise.all(toUpload.map(uploadFile));
      setImages(prev => [...prev, ...urls.filter(Boolean) as string[]]);
    } catch (e: any) {
      setError(e.message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  return (
    <div>
      {/* hidden input で images JSON を送信 */}
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {/* サムネイルグリッド */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((url, i) => (
            <div key={url} className="relative group w-24 h-24 border border-border overflow-hidden bg-gray-100">
              <img src={url} alt={`画像${i + 1}`} className="w-full h-full object-cover" />

              {/* ラベル */}
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-foreground text-background text-[9px] text-center font-tele py-0.5">
                  MAIN
                </span>
              )}

              {/* 操作ボタン（hover時） */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => moveImage(i, i - 1)}
                    className="bg-white text-foreground text-xs px-1.5 py-1 font-bold hover:bg-gray-200" title="前に移動">
                    ←
                  </button>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="bg-accent text-white text-xs px-1.5 py-1 font-bold hover:bg-red-700" title="削除">
                  ✕
                </button>
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(i, i + 1)}
                    className="bg-white text-foreground text-xs px-1.5 py-1 font-bold hover:bg-gray-200" title="後ろに移動">
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* アップロードエリア */}
      {images.length < maxImages && (
        <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed border-border p-6 cursor-pointer transition-colors ${
          uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-gray-50'
        }`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          {uploading ? (
            <span className="font-tele text-xs text-subtext">アップロード中...</span>
          ) : (
            <>
              <span className="font-tele text-xs text-subtext mb-1">クリックして画像を選択</span>
              <span className="text-[10px] text-subtext">JPG / PNG / WebP・最大5MB・あと{maxImages - images.length}枚追加可</span>
            </>
          )}
        </label>
      )}

      {error && <p className="text-accent text-xs mt-2">{error}</p>}
      <p className="text-[10px] text-subtext mt-2">最初の画像がメイン画像として表示されます。ホバーで並び替え・削除が可能です。</p>
    </div>
  );
}
