import * as React from "react";
import { cn } from "../../lib/utils";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const FileUpload = React.forwardRef<
  HTMLDivElement,
  FileUploadProps
>(({ 
  onFileUpload, 
  accept = "image/*", 
  multiple = true, 
  maxSize = 5 * 1024 * 1024, // 5MB default
  className,
  disabled = false,
  children
}, ref) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const errors: string[] = [];

    if (file.size > maxSize) {
      errors.push(`File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
    }

    if (accept && !file.type.match(accept.replace(/\*/g, '.*'))) {
      errors.push(`File ${file.name} type not accepted`);
    }

    if (errors.length > 0) {
      setErrors(prev => [...prev, ...errors]);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...validFiles] : [validFiles[0]]);
      onFileUpload(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        setFiles(prev => multiple ? [...prev, ...validFiles] : [validFiles[0]]);
        onFileUpload(validFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      ref={ref}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple && !disabled}
        onChange={handleFileInputChange}
        disabled={disabled}
      />
      
      <div className="space-y-2">
        {children || (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept.replace(/,/g, ", ").replace(/\*/g, "any")} (Max: {maxSize / 1024 / 1024}MB)
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Selected files:</h4>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <span className="truncate max-w-[70%]">{file.name}</span>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";

export { FileUpload };