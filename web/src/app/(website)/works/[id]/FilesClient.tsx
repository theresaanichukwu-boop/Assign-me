"use client";

import { useState } from "react";

interface FileItem {
  id: string;
  filename: string;
  mime: string;
  sizeBytes: number;
  purpose: string;
  downloadUrl?: string;
}

const ACCEPT = ".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg";

export default function FilesClient({
  workId,
  initialFiles,
}: {
  workId: string;
  initialFiles: FileItem[];
}) {
  const [files, setFiles] = useState(initialFiles);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const r = await fetch(`/api/works/${workId}/files`).then((x) => x.json());
    if (r.files) setFiles(r.files);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      const presign = await fetch(`/api/works/${workId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: f.name, mime: f.type, sizeBytes: f.size, purpose: "reference" }),
      });
      const data = await presign.json();
      if (!presign.ok) throw new Error(data.error ?? "Upload rejected.");
      const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": f.type }, body: f });
      if (!put.ok) throw new Error("Upload to storage failed.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function remove(fileId: string) {
    await fetch(`/api/works/${workId}/files?fileId=${fileId}`, { method: "DELETE" });
    await reload();
  }

  return (
    <section className="mt-8">
      <h2 className="font-bold">Files ({files.length})</h2>
      <label className="mt-2 block max-w-xs text-sm text-muted">
        Upload instructions, drafts, or reference PDFs (max 25 MB)
        <input type="file" accept={ACCEPT} onChange={onPick} disabled={busy} className="mt-1 block" />
      </label>
      {error && <p className="mt-2 text-sm text-err">{error}</p>}
      <ul className="mt-3 flex flex-col gap-2">
        {files.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2 text-sm">
            {f.downloadUrl ? (
              <a href={f.downloadUrl} className="font-medium text-teal" target="_blank" rel="noreferrer">
                {f.filename}
              </a>
            ) : (
              <span className="font-medium">{f.filename}</span>
            )}
            <span className="text-muted">{Math.max(1, Math.round(f.sizeBytes / 1024))} KB</span>
            <button onClick={() => remove(f.id)} className="font-semibold text-err">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
