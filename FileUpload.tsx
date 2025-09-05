import React, { useState, useRef, useCallback } from 'react';

// Icon is now correctly passing the className prop to the SVG element
const FileIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;

interface FileUploadProps {
  onFileRead: (data: { content: string; mimeType: string }) => void;
  onClear: () => void;
  onError: (error: string | null) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileRead, onClear, onError, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      const mimeType = file.type || 'text/plain';
      reader.onload = (e) => onFileRead({ content: e.target?.result as string, mimeType });
      reader.onerror = () => onError("Failed to read the file.");
      if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  }, [onFileRead, onError]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const mockEvent = { target: { files: event.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(mockEvent);
    }
  };

  const triggerFileSelect = () => {
    if (!disabled) fileInputRef.current?.click();
  }

  return (
    <div 
      className={`w-full p-4 border-2 border-dashed border-[#4B5563] rounded-lg text-center transition-colors ${disabled ? 'opacity-50' : 'hover:border-blue-500 cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={triggerFileSelect}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.txt,.csv,.json"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-2 text-gray-400">
          <FileIcon className="h-10 w-10 mb-2" />
          <p>
              <span className="font-semibold text-[#60A5FA]">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs">PDF, TXT, CSV, or JSON files are supported</p>
      </div>
    </div>
  );
};

export default FileUpload;
