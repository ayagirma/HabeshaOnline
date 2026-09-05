"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Both run as the seller's own session; RLS ("seller can mark their
   inquiries read") is what limits them to the seller's own rows. */
export async function markAnswered(id: string) {
  const supabase = await createClient();
  await supabase
    .from("inquiries")
    .update({ status: "answered", responded_at: new Date().toISOString(), is_read: true })
    .eq("id", id);
  revalidatePath("/inbox");
}

export async function markSpam(id: string) {
  const supabase = await createClient();
  await supabase
    .from("inquiries")
    .update({ status: "spam", responded_at: new Date().toISOString(), is_read: true })
    .eq("id", id);
  revalidatePath("/inbox");
}
