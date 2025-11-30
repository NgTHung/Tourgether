"use client";

import { Upload } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  className?: string;
  name?: string;
}

const FileUpload = ({ 
  accept, 
  onFileSelect, 
  maxSize = 5 * 1024 * 1024, // Default 5MB
  label = "Click to upload or drag and drop",
  description,
  className,
  name
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Check file type if accept is provided
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      // Simple check for extensions or mime types
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) return type.toLowerCase() === fileExtension;
        if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', ''));
        return file.type === type;
      });

      if (!isAccepted) {
        toast.error(`File type not accepted. Allowed: ${accept}`);
        return;
      }
    }

    // Check size
    if (file.size > maxSize) {
      toast.error(`File is too large. Max size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
        <Upload className={cn("w-8 h-8 mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
        <p className="text-sm font-medium text-foreground">
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
    </div>
  );
};

export default FileUpload;
