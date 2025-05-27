import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

type FileUploadProps = {
  label?: string;
  text?: string;
  onFileChange: (file: File | null) => void;
  initialPreviewUrl?: string; // for editing existing banner
};

const FileUpload: React.FC<FileUploadProps> = ({
  label = "File",
  onFileChange,
  text = "PROOF OF TRANSACTION",
  initialPreviewUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
        onFileChange(file);
      } else {
        setPreviewUrl(null);
        onFileChange(null);
      }
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

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm mb-2">Image Preview:</p>
          <Image
            src={previewUrl}
            alt="Preview"
            width={200}
            height={200}
            className="w-full max-h-64 object-contain rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
