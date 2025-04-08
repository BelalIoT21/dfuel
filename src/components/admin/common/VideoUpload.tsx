import React, { useState, useRef } from 'react';
import { Button } from '../../ui/button';
import { Upload, X, Video, Info } from 'lucide-react';

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
  maxSize = 100 // Reduced max size for videos
}) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setLoading(true);
    
    try {
      if (!file) {
        return;
      }
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      // Verify it's a video file
      if (!file.type.startsWith('video/')) {
        setError('Please upload a valid video file.');
        return;
      }

      // Create a blob URL instead of data URL for videos
      const blobUrl = URL.createObjectURL(file);
      setPreview(blobUrl);
      onFileChange(blobUrl);

    } catch (error) {
      console.error('Error handling video file:', error);
      setError('Error processing video. Please try again.');
      clearFile();
    } finally {
      setLoading(false);
    }
  };
  
  const clearFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview); // Clean up blob URL
    }
    setPreview(null);
    onFileChange(''); // Send empty string instead of null
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
          disabled={loading}
        >
          <Video className="h-4 w-4" />
          {loading ? 'Processing...' : label}
        </Button>
        
        {preview && (
          <Button 
            type="button" 
            variant="destructive" 
            size="sm" 
            onClick={clearFile}
            className="flex items-center gap-1"
            disabled={loading}
          >
            <X className="h-3 w-3" />
            Remove
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
        <Info className="h-4 w-4" />
        <span>
          Supported formats: mp4, webm, mov (Max size: {maxSize}MB)
        </span>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
        accept="video/mp4,video/webm,video/quicktime"
      />
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      {preview && (
        <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 shadow-inner">
          <div className="aspect-video relative w-full">
            <video 
              src={preview} 
              controls 
              className="w-full h-full object-contain" 
              preload="metadata"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
