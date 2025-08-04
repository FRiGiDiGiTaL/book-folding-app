
import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon } from './Icons';

interface FileInputProps {
  label: string;
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ label, id, file, onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  }, [onFileChange]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0] || null;
    onFileChange(droppedFile);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      <label
        htmlFor={id}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-orange-300 border-dashed rounded-md cursor-pointer hover:border-amber-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {preview ? (
            <img src={preview} alt="Image preview" className="mx-auto h-24 w-auto object-contain rounded" />
          ) : (
            <UploadIcon />
          )}
          <div className="flex text-sm text-stone-600">
            <p className="pl-1">
              {file ? (
                <span className="font-semibold text-amber-800">{file.name}</span>
              ) : (
                <>
                  <span className="font-semibold text-amber-800">Upload a file</span> or drag and drop
                </>
              )}
            </p>
          </div>
          <p className="text-xs text-stone-500">PNG, JPG up to 10MB</p>
        </div>
        <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept=".png,.jpg,.jpeg" />
      </label>
    </div>
  );
};