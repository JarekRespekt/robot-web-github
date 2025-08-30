'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCloudinarySign } from '@/lib/robot-queries';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  value?: {
    public_id: string;
    url: string;
  };
  onChange: (image: { public_id: string; url: string } | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUploader({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { refetch: getSignature } = useCloudinarySign();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Помилка',
        description: 'Оберіть зображення (JPG, PNG, WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Помилка',
        description: 'Розмір файлу не повинен перевищувати 5 МБ',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Get signature from backend
      const signatureResponse = await getSignature();
      if (!signatureResponse.data) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, timestamp, api_key, cloud_name, folder } = signatureResponse.data;

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', api_key);
      if (folder) {
        formData.append('folder', folder);
      }

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await cloudinaryResponse.json();

      // Return uploaded image data
      onChange({
        public_id: result.public_id,
        url: result.secure_url,
      });

      toast({
        title: 'Успіх!',
        description: 'Зображення завантажено',
        variant: 'success',
      });

    } catch (error) {
      toast({
        title: 'Помилка завантаження',
        description: error instanceof Error ? error.message : 'Спробуйте ще раз',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <Card className="relative group overflow-hidden">
          <div className="aspect-video relative">
            <img
              src={value.url}
              alt="Завантажене зображення"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with remove button */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Видалити
              </Button>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-robot-primary" />
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card 
          className={`
            border-dashed border-2 aspect-video flex flex-col items-center justify-center
            transition-colors cursor-pointer hover:border-robot-primary/50
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleClick}
        >
          {uploading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-robot-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Завантаження...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-robot-primary/10 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-6 w-6 text-robot-primary" />
              </div>
              <Button variant="outline" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Завантажити зображення
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG, WebP до 5 МБ
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}