import React, { useState, useRef } from 'react';
import { Button } from '../../ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (dataUrl: string | null) => void;
  existingUrl?: string;
  label?: string;
  maxSize?: number; // Size in MB
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileChange, 
  existingUrl, 
  label = "Upload File", 
  maxSize = 500, // Increased to 500MB
  accept = "image/*"
}) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) {
      return;
    }
    
    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onFileChange(result);
    };
    
    reader.onerror = () => {
      setError('Error reading file');
    };
    
    reader.readAsDataURL(file);
  };
  
  const clearFile = () => {
    setPreview(null);
    onFileChange(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const isImage = preview && (
    preview.startsWith('data:image/') || 
    (existingUrl && (
      existingUrl.endsWith('.jpg') || 
      existingUrl.endsWith('.jpeg') || 
      existingUrl.endsWith('.png') || 
      existingUrl.endsWith('.gif') || 
      existingUrl.endsWith('.webp')
    ))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {label}
        </Button>
        
        {preview && (
          <Button 
            type="button" 
            variant="destructive" 
            size="sm" 
            onClick={clearFile}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Remove
          </Button>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
        accept={accept}
      />
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      {preview && isImage && (
        <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 shadow-inner">
          <div className="aspect-[16/9] relative w-full flex items-center justify-center p-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[400px] max-w-full w-auto h-auto object-contain rounded-md" 
            />
          </div>
        </div>
      )}
      
      {preview && !isImage && (
        <div className="mt-2 p-2 border rounded-md bg-gray-50">
          <p className="text-sm text-gray-600">File uploaded successfully</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
