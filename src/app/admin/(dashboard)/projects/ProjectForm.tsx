"use client";

import { useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { saveProjectAction } from "./actions";
import Link from "next/link";
import type { ProjectWithImages } from "@/db/queries";
import type { Category } from "@/lib/categories";
import { IconAlert, IconClose, IconPhoto, IconPlus, IconUpload } from "../../icons";

export function ProjectForm({
  project,
  categories,
}: {
  project?: ProjectWithImages;
  categories: Category[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [categoryId, setCategoryId] = useState(project?.categoryId ?? "");
  const [coverImage, setCoverImage] = useState(project?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(project?.images.map((image) => image.imageUrl) ?? []);
  /** What is uploading right now, for the status line ("cover", or a photo count). */
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File): Promise<string> {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
    });
    return blob.url;
  }

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading("Uploading cover…");
    setError(null);
    try {
      setCoverImage(await uploadFile(file));
    } catch {
      setError("Cover image upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setUploading(`Uploading ${files.length} ${files.length === 1 ? "photo" : "photos"}…`);
    setError(null);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setImages((previous) => [...previous, ...urls]);
    } catch {
      setError("Gallery image upload failed.");
    } finally {
      setUploading(null);
    }
  }

  function removeImage(url: string) {
    setImages((previous) => previous.filter((image) => image !== url));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await saveProjectAction({
        id: project?.id,
        title,
        description,
        categoryId,
        coverImage,
        images,
      });

      if (!result.valid) {
        setError(Object.values(result.errors)[0]);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = uploading !== null || submitting;
  const photoCount = images.length + (coverImage ? 1 : 0);

  return (
    <form onSubmit={handleSubmit} className="a-form">
      {error && (
        <p className="a-banner" role="alert">
          <IconAlert />
          {error}
        </p>
      )}

      <section className="a-group" aria-labelledby="pf-details">
        <h2 id="pf-details" className="a-group-title">
          Details
        </h2>
        <label className="a-field">
          <span className="a-label">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="a-input"
            placeholder="e.g. ATAL Group Office Building"
          />
        </label>
        <label className="a-field">
          <span className="a-label">Category</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="a-input"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.names.bs}
              </option>
            ))}
          </select>
          <span className="a-field-foot">
            Missing one? <Link href="/categories/new">New category</Link>
          </span>
        </label>
        <label className="a-field">
          <span className="a-label">
            Description <small>A blank line starts a new paragraph</small>
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            className="a-input"
          />
        </label>
      </section>

      <section className="a-group" aria-labelledby="pf-cover">
        <h2 id="pf-cover" className="a-group-title">
          Cover
        </h2>
        <p className="a-group-note">The first photo people see, on the home page and at the top of the project.</p>
        {coverImage ? (
          <div className="a-cover">
            <Image src={coverImage} alt="Cover preview" fill sizes="720px" className="object-cover" />
            <label className="a-cover-replace">
              <IconUpload />
              Replace
              <input type="file" accept="image/*" onChange={handleCoverChange} disabled={busy} />
            </label>
          </div>
        ) : (
          <label className="a-drop" aria-disabled={busy || undefined}>
            <IconPhoto />
            <strong>Choose a cover photo</strong>
            <small>JPG, PNG or WebP</small>
            <input type="file" accept="image/*" onChange={handleCoverChange} disabled={busy} />
          </label>
        )}
      </section>

      <section className="a-group" aria-labelledby="pf-gallery">
        <h2 id="pf-gallery" className="a-group-title">
          Gallery
        </h2>
        <p className="a-group-note">
          These follow the cover in the project&apos;s photo pile, in this order.
        </p>
        <ul className="a-thumbs">
          {images.map((url, i) => (
            <li key={url} className="a-thumb">
              <Image src={url} alt={`Gallery photo ${i + 2}`} fill sizes="120px" className="object-cover" />
              <span className="a-thumb-no">{i + 2}</span>
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label={`Remove photo ${i + 2}`}
                className="a-thumb-remove"
              >
                <IconClose />
              </button>
            </li>
          ))}
          <li>
            <label className="a-drop a-thumb-add" aria-disabled={busy || undefined}>
              <IconPlus />
              <small>Add photos</small>
              <input type="file" accept="image/*" multiple onChange={handleGalleryChange} disabled={busy} />
            </label>
          </li>
        </ul>
      </section>

      <div className="a-savebar">
        <span className="a-savebar-status" aria-live="polite">
          {uploading ? (
            <span className="a-progress">
              <span className="a-spinner" aria-hidden />
              {uploading}
            </span>
          ) : (
            `${photoCount} ${photoCount === 1 ? "photo" : "photos"}`
          )}
        </span>
        <span className="a-savebar-actions">
          <Link href="/" className="a-btn a-btn-plain">
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="a-btn a-btn-primary">
            {submitting ? "Saving…" : project ? "Save changes" : "Create project"}
          </button>
        </span>
      </div>
    </form>
  );
}
