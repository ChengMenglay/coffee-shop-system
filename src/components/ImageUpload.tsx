"use client";

import axios from "axios";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Trash, Upload } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

type ImageUploadProps = {
  value: string;
  onChange: (value: string) => void;
  onDelete: (value: string) => void;
};

function ImageUpload({ value, onChange, onDelete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = res.data;
      
      // Use the unique filename returned from the API
      onChange(result.filename);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    
    setDeleting(true);
    
    try {
      // Delete file from server
      await axios.delete("/api/upload", {
        data: { filename: value }
      });
      
      // Remove from state
      onDelete(value);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-md  bg-white rounded-xl shadow-md p-6 space-y-4">
      {!value && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mb-2"></div>
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-500 mb-1" />
              <p className="text-sm text-gray-500">Click to upload image</p>
              <p className="text-xs text-gray-400 mt-1">Max file size: 5MB</p>
            </>
          )}
        </label>
      )}

      {value && (
        <div className="relative w-full h-[200px] rounded-md overflow-hidden shadow">
          <Image
            fill
            className="object-cover rounded-md"
            src={`/uploads/${value}`} // URL encode the filename
            alt="Preview"
            unoptimized
            onError={(e) => {
              console.error("Image load error:", e);
              toast.error("Failed to load image");
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;