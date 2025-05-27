import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Utility for merging classes, or replace with classNames if preferred
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type FileUploadProps = {
  label?: string;
  text?: string;
  onFileChange: (file: File | null) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({
  label = "File",
  onFileChange,
  text = "PROOF OF TRANSACTION",
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileChange(acceptedFiles[0] || null);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        {...getRootProps()}
        className={cn(
          "rounded-md h-40 bg-button-primary w-full border-2 flex items-center justify-center text-center cursor-pointer",
          isDragActive && "border-blue-500 bg-blue-50"
        )}
      >
        <Input
          variant="non-card"
          {...getInputProps()}
          className="hidden"
          type="file"
        />

        <h1 className="text-lg font-bold text-center">{text}</h1>
      </div>
    </div>
  );
};

export default FileUpload;
