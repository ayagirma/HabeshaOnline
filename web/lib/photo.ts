/* Supabase Storage is a public bucket ("listing-photos"), so a photo's
   URL is just its path under the bucket's public prefix — no client call,
   no signed URL. Works the same on the server and in the browser because
   the base URL is a NEXT_PUBLIC_ value. */

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/`;

export const PHOTO_BUCKET = "listing-photos";

export function photoUrl(storagePath: string): string {
  return BASE + storagePath;
}
