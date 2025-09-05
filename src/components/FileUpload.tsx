import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud } from './Icons';

interface Props {
  onSubmit: (content: string, mimeType: string) => void;
}

export const FileUpload: React.FC<Props> = ({ onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || !files[0]) return;
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      setBusy(true);
      try {
        if (ext === 'pdf') {
          const content = await readAsDataURL(file); // send as data URL; backend can decode
          await onSubmit(content, 'application/pdf');
        } else if (ext === 'txt' || ext === 'csv' || ext === 'json') {
          const text = await readAsText(file);
          const mime = ext === 'csv' ? 'text/csv' : ext === 'json' ? 'application/json' : 'text/plain';
          await onSubmit(text, mime);
        } else {
          alert('Unsupported file type. Use .pdf, .txt, .csv, or .json');
        }
      } finally {
        setBusy(false);
      }
    },
    [onSubmit]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`bg-white border rounded-2xl p-4 shadow-sm transition-colors ${dragOver ? 'border-black' : 'border-neutral-200'}`}
    >
      <label className="text-sm font-medium mb-3 block">Drag & drop your credit report</label>
      <div className="grid place-items-center gap-3 p-8 border-2 border-dashed rounded-xl">
        <UploadCloud className="h-8 w-8" />
        <div className="text-sm text-neutral-600">.pdf · .txt · .csv · .json</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Reading…' : 'Choose file'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.csv,.json"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>
    </div>
  );
};

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


