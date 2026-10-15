import { useEffect, useRef, useState } from "react";
import { compressImage } from "../../utils/image";
export function ImageUpload({
  onChange,
  preview,
  onBusyChange,
}: {
  onChange: (blob: Blob | null) => void;
  preview?: string;
  onBusyChange?: (busy: boolean) => void;
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
      <label className="block space-y-3">
        Product image
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => void pick(e.target.files?.[0])}
          className="block w-full"
        />
      </label>
      <p className="my-2 text-xs text-slate-500">
        Drop an image here. JPEG, PNG or WebP; up to 20 MB. Compressed to 800px.
      </p>
      {(url || preview) && (
        <img
          src={url || preview}
          alt="Product preview"
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
