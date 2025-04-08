
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
  maxSize = 500 // Increased to 500MB
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
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
      
      {preview && (
        <div className="mt-2 border rounded-md overflow-hidden bg-gray-50">
          <video 
            src={preview} 
            controls 
            className="max-h-40 max-w-full" 
          />
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
