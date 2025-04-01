
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fileToDataUrl, 
  validateFile, 
  IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB,
  compressImageIfNeeded 
} from '@/utils/fileUpload';

interface FileUploadProps {
  existingUrl?: string;
  onFileChange: (dataUrl: string | null) => void;
  label?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  compressImages?: boolean;
  targetCompressedSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  existingUrl,
  onFileChange,
  label = 'Upload File',
  maxSizeMB = MAX_IMAGE_SIZE_MB,
  allowedTypes = IMAGE_TYPES,
  compressImages = true,
  targetCompressedSizeMB = 5 // Increased from 2MB to 5MB
}) => {
  // Format existing URL if it's a server path
  const formatExistingUrl = (url?: string) => {
    if (!url) return null;
    
    if (url.startsWith('/utils/images')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${apiUrl}/api${url}`;
    }
    
    return url;
  };

  const [preview, setPreview] = useState<string | null>(formatExistingUrl(existingUrl) || null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setFileName(file.name);
      
      // Calculate and format file size
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setOriginalSize(`${fileSizeMB} MB`);
      
      console.log(`Processing file: ${file.name}, size: ${fileSizeMB} MB, type: ${file.type}`);

      // Validate file type and size
      const validationError = validateFile(file, allowedTypes, maxSizeMB);
      if (validationError) {
        toast({
          title: 'Invalid File',
          description: validationError,
          variant: 'destructive',
        });
        setIsUploading(false);
        return;
      }

      // Convert file to data URL
      let dataUrl = await fileToDataUrl(file);
      let finalSize = fileSizeMB;
      
      // Compress image if it's an image and compression is enabled
      const isImage = allowedTypes.every(type => type.startsWith('image/'));
      if (isImage && compressImages && parseFloat(fileSizeMB) > targetCompressedSizeMB) {
        console.log(`Attempting to compress image from ${fileSizeMB} MB to target ${targetCompressedSizeMB} MB`);
        
        // Compress the image
        const compressedDataUrl = await compressImageIfNeeded(dataUrl, targetCompressedSizeMB, 0.9); // Higher initial quality
        
        // Calculate the new size and update
        finalSize = ((compressedDataUrl.length * 0.75) / (1024 * 1024)).toFixed(2); // Approximate base64 size
        console.log(`Image compressed from ${fileSizeMB} MB to ${finalSize} MB`);
        
        // Use the compressed version
        dataUrl = compressedDataUrl;
        
        if (parseFloat(finalSize) < parseFloat(fileSizeMB)) {
          toast({
            title: 'Image Compressed',
            description: `Reduced from ${fileSizeMB} MB to ${finalSize} MB`,
          });
        }
      }
      
      setFileSize(`${finalSize} MB`);
      setPreview(dataUrl);
      onFileChange(dataUrl);
      
      toast({
        title: 'File Uploaded',
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setOriginalSize(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageType = allowedTypes.every(type => type.startsWith('image/'));

  // Properly display existing images
  const displayPreview = preview || (existingUrl ? formatExistingUrl(existingUrl) : null);

  console.log("FileUpload: displaying image preview:", displayPreview);

  return (
    <div className="space-y-2">
      {displayPreview ? (
        <div className="relative border border-gray-200 rounded-md overflow-hidden">
          {isImageType && (
            <div className="relative aspect-video">
              <img
                src={displayPreview}
                alt="Preview"
                className="w-full h-full object-contain bg-gray-50"
                onError={(e) => {
                  console.error(`Failed to load image: ${displayPreview}`);
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}
          
          <div className="p-2 bg-gray-50 flex justify-between items-center">
            <div className="text-sm">
              {fileName && <p className="font-medium truncate">{fileName}</p>}
              {fileSize && (
                <p className="text-xs text-gray-500">
                  {fileSize}
                  {originalSize && originalSize !== fileSize && ` (original: ${originalSize})`}
                </p>
              )}
              {!fileName && existingUrl && <p className="text-xs text-gray-500">Existing file</p>}
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              onClick={handleRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            {isImageType ? (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            <div className="text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                <span>{label}</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept={allowedTypes.join(',')}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {isImageType 
                ? `Supports ${allowedTypes.map(t => t.split('/')[1]).join(', ')} up to ${maxSizeMB}MB`
                : `Max file size: ${maxSizeMB}MB`}
            </p>
            {compressImages && isImageType && (
              <p className="text-xs text-gray-500">
                Large images will be compressed automatically
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
