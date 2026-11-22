"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { IconAlert, IconCheck, IconExternal, IconUpload } from "../../icons";
import { saveCvUrlAction } from "./actions";

/** The file name at the end of a blob URL, without the random suffix Blob adds. */
function fileName(url: string) {
  const last = decodeURIComponent(url.split("/").pop() ?? url);
  return last.replace(/-[A-Za-z0-9]{20,}(?=\.\w+$)/, "");
}

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
    <div className="a-form">
      {error && (
        <p className="a-banner" role="alert">
          <IconAlert />
          {error}
        </p>
      )}
      {success && (
        <p className="a-banner is-success" role="status">
          <IconCheck />
          CV updated. The &ldquo;Download CV&rdquo; button on the site now opens the new file.
        </p>
      )}

      <section className="a-group" aria-labelledby="cv-current">
        <h2 id="cv-current" className="a-group-title">
          Current CV
        </h2>
        {currentCvUrl ? (
          <div className="a-file">
            <span className="a-file-icon" aria-hidden>
              PDF
            </span>
            <div className="a-file-text">
              <p className="a-file-name">{fileName(currentCvUrl)}</p>
              <p className="a-file-sub">Linked from the About section of the site</p>
            </div>
            <a href={currentCvUrl} target="_blank" rel="noreferrer" className="a-btn a-btn-sm">
              <IconExternal />
              Open
            </a>
          </div>
        ) : (
          <p className="a-group-note" style={{ margin: 0 }}>
            No CV uploaded yet. Until there is one, the site shows a &ldquo;Get in touch&rdquo; button instead.
          </p>
        )}
      </section>

      <section className="a-group" aria-labelledby="cv-upload">
        <h2 id="cv-upload" className="a-group-title">
          {currentCvUrl ? "Replace" : "Upload"}
        </h2>
        <label className="a-drop" aria-disabled={uploading || undefined}>
          {uploading ? <span className="a-spinner" aria-hidden /> : <IconUpload />}
          <strong aria-live="polite">{uploading ? "Uploading…" : "Choose a PDF"}</strong>
          <small>The new file replaces the current one right away.</small>
          <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} />
        </label>
      </section>
    </div>
  );
}
