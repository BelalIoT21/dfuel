
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUrl, validateFile, IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/utils/fileUpload';

interface FileUploadProps {
  existingUrl?: string;
  onFileChange: (dataUrl: string | null) => void;
  label?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  existingUrl,
  onFileChange,
  label = 'Upload File',
  maxSizeMB = MAX_IMAGE_SIZE_MB,
  allowedTypes = IMAGE_TYPES,
}) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
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
      setFileSize(`${fileSizeMB} MB`);
      
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

      // Use a more optimized approach for large files
      const dataUrl = await fileToDataUrl(file);
      
      // For large files, log size info but not the entire content
      console.log(`File converted to data URL (length: ${dataUrl.length}, approximate size: ${(dataUrl.length / 1.37 / 1024 / 1024).toFixed(2)} MB)`);
      
      setPreview(dataUrl);
      onFileChange(dataUrl);
      
      toast({
        title: 'File Uploaded',
        description: `${file.name} (${fileSizeMB} MB) uploaded successfully`,
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
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageType = allowedTypes.every(type => type.startsWith('image/'));

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative border border-gray-200 rounded-md overflow-hidden">
          {isImageType && (
            <div className="relative aspect-video">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain bg-gray-50"
              />
            </div>
          )}
          
          <div className="p-2 bg-gray-50 flex justify-between items-center">
            <div className="text-sm">
              {fileName && <p className="font-medium truncate">{fileName}</p>}
              {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
