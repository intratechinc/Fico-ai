import React, { useState, useRef, useCallback } from 'react';
import { DocumentArrowUpIcon } from './components/Icons';

interface FileUploadProps {
  onFileRead: (fileData: { content: string; mimeType: string }) => void;
  onClear: () => void;
  onError: (message: string) => void;
  disabled: boolean;
}

const ACCEPTED_FILE_TYPES = ['text/plain', 'text/csv', 'application/json', 'application/pdf'];
const ACCEPTED_EXTENSIONS = '.txt, .csv, .json, .pdf';

const FileUpload: React.FC<FileUploadProps> = ({ onFileRead, onClear, onError, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      onError(`Invalid file type. Please upload a ${ACCEPTED_EXTENSIONS} file.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onFileRead({ content: result, mimeType: file.type });
        setFileName(file.name);
        onError(''); // Clear previous errors
      } else {
        onError("Could not read the file. It might be empty or corrupted.");
      }
    };
    reader.onerror = () => {
      onError("Failed to read the file.");
    };
    
    if (file.type === 'application/pdf') {
        reader.readAsDataURL(file); // Read PDF as Base64 Data URL
    } else {
        reader.readAsText(file); // Read other files as plain text
    }
  }, [onFileRead, onError]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setFileName(null);
    onClear();
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  }

  return (
    <div>
      {!fileName ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full h-48 p-3 flex flex-col items-center justify-center bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-gray-800' : 'hover:border-gray-500'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_EXTENSIONS}
            className="hidden"
            disabled={disabled}
          />
          <DocumentArrowUpIcon className="h-12 w-12 text-gray-500 mb-2" />
          <p className="text-gray-400">
            <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, TXT, CSV, or JSON files are supported
          </p>
        </div>
      ) : (
        <div className="w-full h-48 p-3 flex flex-col items-center justify-center bg-gray-900 border border-green-700 rounded-lg">
            <p className="text-lg font-medium text-green-300">File Ready for Analysis</p>
            <p className="text-gray-300 mt-2 mb-4">{fileName}</p>
            <button
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                disabled={disabled}
            >
                Clear File
            </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;