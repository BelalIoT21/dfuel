
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  validateFile, 
  fileToDataUrl, 
  IMAGE_TYPES, 
  MAX_IMAGE_SIZE_MB
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
    
    // Display file size for debugging
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileSizeKB = (file.size / 1024).toFixed(2);
    console.log(`Processing file: ${file.name}, size: ${fileSizeMB}MB (${fileSizeKB}KB), type: ${file.type}`);
    
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
      // Get data URL directly without compression
      const dataUrl = await fileToDataUrl(file);
      
      const dataUrlSizeMB = (dataUrl.length / (1024 * 1024)).toFixed(2);
      const dataUrlSizeKB = (dataUrl.length / 1024).toFixed(2);
      console.log(`File converted to data URL, size: ${dataUrlSizeMB}MB (${dataUrlSizeKB}KB)`);
      
      // Update the preview and notify parent component
      setPreview(dataUrl);
      onFileChange(dataUrl);
      
      toast({
        title: "File Uploaded",
        description: `Successfully processed ${file.name} (${fileSizeKB}KB)`,
        duration: 3000
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process the file. Please try a smaller image.",
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
            Max file size: {maxSizeMB}MB ({Math.round(maxSizeMB * 1024)}KB). For best results, use images under 100KB.
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
