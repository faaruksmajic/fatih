"use client";

import { useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { saveProjectAction } from "./actions";
import Link from "next/link";
import type { ProjectWithImages } from "@/db/queries";
import type { Category } from "@/lib/categories";

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
  const [uploading, setUploading] = useState(false);
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
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setCoverImage(await uploadFile(file));
    } catch {
      setError("Cover image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setImages((previous) => [...previous, ...urls]);
    } catch {
      setError("Gallery image upload failed.");
    } finally {
      setUploading(false);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="border border-ink/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          className="border border-ink/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="border border-ink/20 px-3 py-2 bg-paper"
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
        <Link href="/categories/new" className="self-start text-xs underline text-ink/60">
          + New category
        </Link>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Cover image
        <input type="file" accept="image/*" onChange={handleCoverChange} />
      </label>
      {coverImage && (
        <div className="relative w-full max-w-xs aspect-[10/7]">
          <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
        </div>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Gallery images
        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="relative w-20 h-20">
            <Image src={url} alt="Gallery preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 bg-ink text-paper w-7 h-7 text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={uploading || submitting}
        className="bg-ink text-paper font-semibold px-4 py-2 min-h-11 disabled:opacity-50 sticky bottom-4 sm:static"
      >
        {submitting ? "Saving..." : uploading ? "Uploading..." : "Save project"}
      </button>
    </form>
  );
}
