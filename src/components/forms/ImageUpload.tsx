import { useEffect, useRef, useState } from "react";
import { compressImage } from "../../utils/image";
import {CloudUpload} from 'lucide-react';
export function ImageUpload({
  onChange,
  label="Product image",
  preview,
  onBusyChange,
  visual = false,
}: {
  onChange: (blob: Blob | null) => void;
  label?:string;
  preview?: string;
  onBusyChange?: (busy: boolean) => void;
  visual?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function pick(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    try {
      const blob = await compressImage(file);
      setUrl(URL.createObjectURL(blob));
      onChange(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load image.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void pick(e.dataTransfer.files[0]);
      }}
      className="rounded-lg border-2 border-dashed border-slate-300 p-5 dark:border-slate-600"
    >
      <label className={visual?'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded bg-slate-50 px-4 text-center focus-within:outline focus-within:outline-2 focus-within:outline-indigo-500 dark:bg-slate-800':'block space-y-3'}>
        {visual&&<CloudUpload size={30} className="text-indigo-500"/>}
        <span>{visual?'Drag & drop an image or click to upload':label}</span>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => void pick(e.target.files?.[0])}
          aria-label={label}
          className={visual?'sr-only':'block w-full'}
        />
      </label>
      <p className="my-2 text-xs text-slate-500">
        Drop an image here. JPEG, PNG or WebP; up to 20 MB. Compressed to 800px.
      </p>
      {(url || preview) && (
        <img
          src={url || preview}
          alt={`${label} preview`}
          className="mt-3 h-36 w-36 rounded-lg object-contain"
        />
      )}
      {url && (
        <button
          type="button"
          className="btn mt-3"
          onClick={() => {
            setUrl("");
            onChange(null);
            if (input.current) input.current.value = "";
          }}
        >
          Discard new image
        </button>
      )}
      {busy && <p role="status">Compressing image…</p>}
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
