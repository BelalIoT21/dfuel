import React, { useState, useRef } from 'react';
import { Button } from '../../ui/button';
import { Upload, X, Info } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (dataUrl: string | null) => void;
  existingUrl?: string;
  label?: string;
  maxSize?: number; // Size in MB
  accept?: string;
  type?: 'image' | 'video' | 'all';
}

const SUPPORTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif']
};

const SUPPORTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/x-matroska': ['.mkv'],
  'video/x-ms-wmv': ['.wmv'],
  'video/3gpp': ['.3gp'],
  'video/x-flv': ['.flv']
};

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileChange, 
  existingUrl, 
  label = "Upload File",
  maxSize = 10, // Reduced default max size to 10MB
  accept,
  type = 'image'
}) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSupportedTypes = () => {
    if (type === 'image') return SUPPORTED_IMAGE_TYPES;
    if (type === 'video') return SUPPORTED_VIDEO_TYPES;
    return { ...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES };
  };

  const getAcceptString = () => {
    const types = getSupportedTypes();
    return Object.entries(types)
      .flatMap(([mimeType, extensions]) => 
        extensions.map(ext => `${mimeType},${ext}`)
      )
      .join(',');
  };

  const getSupportedFormatsString = () => {
    const types = getSupportedTypes();
    return Object.values(types)
      .flat()
      .join(', ');
  };

  const isFileTypeSupported = (file: File) => {
    const supportedTypes = getSupportedTypes();
    return Object.keys(supportedTypes).includes(file.type);
  };

  const compressImage = async (file: File, dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Max dimension for images

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          } else {
            width = Math.round(width * (maxDimension / height));
            height = maxDimension;
          }
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw image with white background for PNG
        if (file.type === 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality
        let quality = 0.9;
        let compressed = canvas.toDataURL('image/jpeg', quality);
        
        // Target size of 500KB
        const targetSize = 0.5 * 1024 * 1024;
        
        // Reduce quality until file size is under target
        while (compressed.length > targetSize && quality > 0.3) {
          quality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', quality);
          // Update progress
          setProgress(Math.round((1 - (compressed.length / dataUrl.length)) * 100));
        }

        // If still too large, reduce dimensions
        if (compressed.length > targetSize) {
          const scale = Math.sqrt(targetSize / compressed.length);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          canvas.width = width;
          canvas.height = height;
          
          // Redraw with white background for PNG
          if (file.type === 'image/png') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setLoading(true);
    setProgress(0);
    
    if (!file) {
      setLoading(false);
      return;
    }

    // Check file type
    if (!isFileTypeSupported(file)) {
      setError(`Unsupported file type. Supported formats: ${getSupportedFormatsString()}`);
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check initial file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const result = reader.result as string;
        
        try {
          if (file.type.startsWith('image/')) {
            // For images, compress
            const compressed = await compressImage(file, result);
            console.log('Original size:', Math.round(result.length / 1024), 'KB');
            console.log('Compressed size:', Math.round(compressed.length / 1024), 'KB');
            setPreview(compressed);
            onFileChange(compressed);
          } else if (file.type.startsWith('video/')) {
            // For videos, create a blob URL
            const blob = new Blob([file], { type: file.type });
            const blobUrl = URL.createObjectURL(blob);
            setPreview(blobUrl);
            onFileChange(blobUrl);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          setError('Error processing file. Please try again.');
          clearFile();
        }
        setLoading(false);
        setProgress(100);
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        clearFile();
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling file:', error);
      setError('Error handling file. Please try again.');
      clearFile();
      setLoading(false);
    }
  };
  
  const clearFile = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onFileChange('');
    setProgress(0);
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

  const isVideo = preview && (
    preview.startsWith('blob:') ||
    preview.startsWith('data:video/') ||
    (existingUrl && (
      existingUrl.endsWith('.mp4') ||
      existingUrl.endsWith('.webm') ||
      existingUrl.endsWith('.mov')
    ))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Upload className="h-4 w-4" />
            {loading ? `Processing (${progress}%)` : label}
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
            {type === 'video' 
              ? `Supported formats: mp4, webm, mov, avi, mkv, wmv, 3gp, flv (Max size: ${maxSize}MB)`
              : `Supported formats: jpg, jpeg, png, webp, gif (Images will be compressed to optimize loading)`
            }
          </span>
        </div>
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept || getAcceptString()}
      />
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      {loading && progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {preview && isImage && (
        <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 p-4 flex justify-center items-center">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-[400px] w-auto object-contain rounded-md" 
          />
        </div>
      )}
      
      {preview && isVideo && (
        <div className="mt-4 border rounded-lg overflow-hidden bg-gray-50 p-4">
          <video 
            src={preview}
            controls
            className="max-h-[400px] w-full object-contain rounded-md"
            preload="metadata"
          />
        </div>
      )}
      
      {preview && !isImage && !isVideo && (
        <div className="mt-2 p-2 border rounded-md bg-gray-50">
          <p className="text-sm text-gray-600">File uploaded successfully</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
