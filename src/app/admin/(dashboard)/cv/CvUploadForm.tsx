"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { saveCvUrlAction } from "./actions";

export function CvUploadForm({ currentCvUrl }: { currentCvUrl: string | null }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      const result = await saveCvUrlAction(blob.url);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("CV upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">CV updated successfully.</p>}
      <div>
        <p className="text-sm text-ink/60 mb-1">Current CV</p>
        {currentCvUrl ? (
          <a href={currentCvUrl} target="_blank" rel="noreferrer" className="text-sm underline break-all">
            {currentCvUrl}
          </a>
        ) : (
          <p className="text-sm text-ink/60">No CV uploaded yet.</p>
        )}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        {currentCvUrl ? "Replace CV (PDF)" : "Upload CV (PDF)"}
        <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} />
      </label>
      {uploading && <p className="text-sm text-ink/60">Uploading...</p>}
    </div>
  );
}
