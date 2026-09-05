/* Client-side image shrink — ported from src/js/media.js. Every photo is
   decoded, scaled to a sane long edge, and re-encoded as JPEG in the
   browser before it's uploaded, so the original camera file (often
   5–12 MB) never travels over the wire. Returns a Blob ready for a
   Supabase Storage upload. */

const MAX_EDGE = 1400; // px on the long side
const TARGET = 220_000; // bytes — aim under this
const HARD_CAP = 500_000; // give up past this

function readAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

function draw(img: HTMLImageElement, edge: number): HTMLCanvasElement {
  const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * scale));
  c.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/jpeg",
      quality,
    );
  });
}

/* Resolves a JPEG Blob small enough to store, or throws "too-large". */
export async function shrinkImage(file: File): Promise<Blob> {
  const img = await readAsImage(file);
  let edge = MAX_EDGE;
  let out: Blob | null = null;

  for (let pass = 0; pass < 4; pass++) {
    const canvas = draw(img, edge);
    let q = 0.82;
    for (let i = 0; i < 4; i++) {
      out = await toJpeg(canvas, q);
      if (out.size <= TARGET) return out;
      q -= 0.14;
    }
    edge = Math.round(edge * 0.75);
  }

  if (out && out.size <= HARD_CAP) return out;
  throw new Error("too-large");
}
