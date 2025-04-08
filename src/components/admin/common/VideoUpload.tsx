
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Video } from 'lucide-react';

interface VideoUploadProps {
  onFileChange: (dataUrl: string | null) => void;
  existingUrl?: string;
  label?: string;
  maxSize?: number; // Size in MB
}

const VideoUpload: React.FC<VideoUploadProps> = ({ 
  onFileChange, 
  existingUrl,
  label = "Upload Video", 
  maxSize = 250 // Reduced from 500MB to 250MB to prevent timeouts
}) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
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
    
    // Store and log file type for debugging
    setFileType(file.type);
    console.log('File type:', file.type, 'File size:', Math.round(file.size / (1024 * 1024)), 'MB');
    
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
    setFileType(null);
    onFileChange(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4 text-purple-600" />
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
        accept="video/mp4,video/webm,video/quicktime,video/avi,video/x-msvideo,.mov"
      />
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      {fileType && (
        <div className="text-xs text-gray-500">
          File type: {fileType}
        </div>
      )}
      
      {preview && (
        <div className="mt-2 border rounded-md overflow-hidden bg-gray-50">
          <video 
            src={preview} 
            controls 
            className="w-full max-h-60" 
            preload="metadata"
          />
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
