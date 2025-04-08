
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  validateFile, 
  fileToDataUrl, 
  VIDEO_TYPES, 
  MAX_VIDEO_SIZE_MB 
} from '@/utils/fileUpload';

interface VideoUploadProps {
  onFileChange: (dataUrl: string | null) => void;
  existingUrl?: string;
  className?: string;
  label?: string;
  previewHeight?: string;
}

const VideoUpload = ({
  onFileChange,
  existingUrl,
  className = "",
  label = "Upload Video",
  previewHeight = "max-h-[300px]"
}: VideoUploadProps) => {
  // Format existing URL if it's a server path
  const formatExistingUrl = (url?: string) => {
    if (!url) return null;
    
    if (url.startsWith('/utils/videos') || url.startsWith('/utils/images')) {
      console.log("Converting server path to absolute URL:", url);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      return `${apiUrl}/api${url}`;
    }
    
    return url;
  };

  const [preview, setPreview] = useState<string | null>(formatExistingUrl(existingUrl) || null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validationError = validateFile(file, VIDEO_TYPES, MAX_VIDEO_SIZE_MB);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setFileName(file.name);
    
    try {
      const dataUrl = await fileToDataUrl(file);
      console.log(`Video processed: ${file.name}, size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      
      setPreview(dataUrl);
      onFileChange(dataUrl);
      
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process the video",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    onFileChange(null);
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <video 
            src={preview} 
            controls
            className={`w-full h-auto ${previewHeight}`}
            onError={(e) => {
              console.error(`Failed to load video: ${preview}`);
            }}
          />
          <div className="p-2 bg-gray-50 flex justify-between items-center">
            <div className="text-sm">
              {fileName && <p className="font-medium truncate">{fileName}</p>}
              {!fileName && existingUrl && <p className="text-xs text-gray-500">Existing video</p>}
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-8 w-8 rounded-full opacity-80"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-gray-500" />
            <span className="text-sm">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500">
            Max video size: {MAX_VIDEO_SIZE_MB}MB
          </p>
          <p className="text-xs text-gray-500">
            Supports mp4, webm, ogg, mov formats
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

export default VideoUpload;
