"use client";

import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { getPresignedUrl } from "~/actions/upload";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUpload = ({ images, onImagesChange }: ImageUploadProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files in parallel
      const uploadPromises = files.map(async (file) => {
        try {
          const { uploadUrl, fileUrl } = await getPresignedUrl(
            file.name,
            file.type,
            file.size,
            'image'
          );

          const response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
              
            },
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          return fileUrl;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw error;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
      toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage!);
    
    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  return (
    <div className="space-y-4">
      <label className={cn(
        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors",
        isUploading && "opacity-50 cursor-not-allowed"
      )}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground mb-2 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => setDraggedIndex(null)}
            className={cn(
              "relative group cursor-move rounded-lg overflow-hidden border-2",
              index === 0 && "col-span-2 border-primary",
              index !== 0 && "border-border"
            )}
          >
            <Image fill={true} src={image} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover" />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Cover Image
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => removeImage(index)}
                className="bg-destructive text-destructive-foreground p-1 rounded hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;
