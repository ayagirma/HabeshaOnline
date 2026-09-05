"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { shrinkImage } from "@/lib/shrink";
import { photoUrl, PHOTO_BUCKET } from "@/lib/photo";
import { useLang } from "@/lib/i18n-context";

export type PhotoState = {
  paths: string[];
  coverUrl: string | null;
  pending: boolean;
};

type Item = {
  key: string;
  localUrl: string;
  path: string | null;
  status: "up" | "ok" | "err";
};

/* Photos are shrunk on the seller's device (lib/shrink.ts) and uploaded
   straight to Supabase Storage from the browser — the listing row doesn't
   exist yet, so each object lands at `${uid}/${uuid}.jpg` and the paths
   ride along in a hidden field. createListing() links them to the new
   listing and re-checks the tier's photo cap. */
export function PhotoPicker({
  max,
  onChange,
}: {
  max: number;
  onChange: (s: PhotoState) => void;
}) {
  const { t } = useLang();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function emit(list: Item[]) {
    const ok = list.filter((i) => i.status === "ok" && i.path);
    onChange({
      paths: ok.map((i) => i.path as string),
      coverUrl: ok[0] ? photoUrl(ok[0].path as string) : null,
      pending: list.some((i) => i.status === "up"),
    });
  }

  async function addFiles(files: FileList | null) {
    if (!files || !files.length || busy) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const room = Math.max(0, max - items.length);
    const chosen = Array.from(files).slice(0, room);
    if (inputRef.current) inputRef.current.value = "";
    if (!chosen.length) return;

    setBusy(true);
    const seeded: Item[] = chosen.map((f) => ({
      key: crypto.randomUUID(),
      localUrl: URL.createObjectURL(f),
      path: null,
      status: "up",
    }));
    let current = [...items, ...seeded];
    setItems(current);

    for (let i = 0; i < chosen.length; i++) {
      const seed = seeded[i];
      try {
        const blob = await shrinkImage(chosen[i]);
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (error) throw error;
        current = current.map((it) =>
          it.key === seed.key ? { ...it, path, status: "ok" as const } : it,
        );
      } catch {
        current = current.map((it) =>
          it.key === seed.key ? { ...it, status: "err" as const } : it,
        );
      }
      setItems(current);
      emit(current);
    }
    setBusy(false);
  }

  async function remove(key: string) {
    const target = items.find((i) => i.key === key);
    const next = items.filter((i) => i.key !== key);
    setItems(next);
    emit(next);
    if (target) URL.revokeObjectURL(target.localUrl);
    if (target?.path) {
      const supabase = createClient();
      await supabase.storage.from(PHOTO_BUCKET).remove([target.path]);
    }
  }

  const full = items.length >= max;
  const coverKey = items.find((i) => i.status === "ok")?.key;

  return (
    <div className="field">
      <div className="photo-grid">
        {items.map((it) => {
          const isCover = it.key === coverKey;
          return (
            <div key={it.key} className={`photo-slot ${it.status === "up" ? "up" : ""} ${it.status === "err" ? "err" : ""}`}>
              {it.status === "err" ? (
                <span>{t("post.photoBad")}</span>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.localUrl} alt="" />
                  {isCover && <span className="badge">{t("post.photoCover")}</span>}
                </>
              )}
              <button
                type="button"
                className="rm"
                onClick={() => remove(it.key)}
                aria-label={t("common.delete")}
              >
                ✕
              </button>
            </div>
          );
        })}

        {!full && (
          <button
            type="button"
            className="photo-add"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <span className="plus" aria-hidden="true">
              +
            </span>
            <span>{busy ? t("post.photoUploading") : t("post.addPhoto")}</span>
          </button>
        )}
      </div>
      <span className="hint">{t("post.photoHint", { n: String(max) })}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
