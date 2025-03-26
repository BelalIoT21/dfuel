
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
}

const VideoUpload = ({
  onFileChange,
  existingUrl,
  className = "",
}: VideoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const [loading, setLoading] = useState(false);
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
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      onFileChange(dataUrl);
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
    onFileChange(null);
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200">
          <video 
            src={preview} 
            controls
            className="w-full h-auto max-h-[300px]"
          />
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
            <Video className="h-5 w-5 text-gray-500" />
            <span className="text-sm">Upload Video</span>
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
