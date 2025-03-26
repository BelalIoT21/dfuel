
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  validateFile, 
  fileToDataUrl, 
  IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB,
  compressImageIfNeeded
} from '@/utils/fileUpload';

interface FileUploadProps {
  onFileChange: (dataUrl: string | null) => void;
  existingUrl?: string;
  label?: string;
  accept?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

const FileUpload = ({
  onFileChange,
  existingUrl,
  label = "Upload Image",
  accept = "image/*",
  allowedTypes = IMAGE_TYPES,
  maxSizeMB = MAX_IMAGE_SIZE_MB,
  className = "",
}: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validationError = validateFile(file, allowedTypes, maxSizeMB);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Display file size for debugging
      console.log(`Processing file: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      
      // Get base data URL
      const dataUrl = await fileToDataUrl(file);
      
      // Try to optimize large images
      const optimizedDataUrl = await compressImageIfNeeded(dataUrl, maxSizeMB);
      
      setPreview(optimizedDataUrl);
      onFileChange(optimizedDataUrl);
      
      // Inform the user about large files
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Large File",
          description: "This file is quite large. Processing might take longer than usual.",
          duration: 5000
        });
      } else {
        toast({
          title: "File Uploaded",
          description: `Successfully processed ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process the file",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const clearFile = () => {
    setPreview(null);
    onFileChange(null);
  };
  
  const isImage = accept.includes('image');
  
  return (
    <div className={`space-y-2 ${className}`}>
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          {isImage ? (
            <img 
              src={preview} 
              alt="File preview" 
              className="w-full h-auto max-h-[200px] object-contain bg-gray-50"
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-50 p-4 h-[200px]">
              <File className="w-16 h-16 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">File uploaded</span>
            </div>
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80"
            onClick={clearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {isImage ? (
              <Image className="h-5 w-5 text-gray-500" />
            ) : (
              <File className="h-5 w-5 text-gray-500" />
            )}
            <span className="text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500">
            Max file size: {maxSizeMB}MB
          </p>
        </>
      )}
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
