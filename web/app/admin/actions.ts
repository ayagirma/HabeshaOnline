"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Every one of these relies on RLS to actually enforce "admin only" —
   they run as the calling user's own session (via lib/supabase/server),
   never a service-role key. A non-admin calling one of these directly
   would just have the update silently affect zero rows; the guard
   trigger in the migration is what makes that true, not this file. */

export async function approveListing(id: string) {
  const supabase = await createClient();
  await supabase.from("listings").update({ status: "active" }).eq("id", id);
  revalidatePath("/admin");
}

export async function suspendListing(id: string) {
  const supabase = await createClient();
  await supabase.from("listings").update({ status: "suspended" }).eq("id", id);
  revalidatePath("/admin");
}

export async function removeListing(id: string) {
  const supabase = await createClient();
  await supabase.from("listings").update({ status: "removed" }).eq("id", id);
  revalidatePath("/admin");
}

export async function resolveReport(id: string) {
  const supabase = await createClient();
  await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
  revalidatePath("/admin");
}

/* Remove-listing-from-a-report: seize the listing and close the report
   in one action, so a report doesn't linger open after its listing is
   already gone. */
export async function removeListingAndResolve(listingId: string, reportId: string) {
  const supabase = await createClient();
  await supabase.from("listings").update({ status: "removed" }).eq("id", listingId);
  await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  revalidatePath("/admin");
}

/* Paid plans settle by hand (Cash App / Zelle). Once an admin has seen
   the transfer land, "mark paid & approve" confirms it and puts the ad
   live in one step; "mark paid" alone just clears the fee (e.g. the ad
   still needs a content check). */
export async function markPaidAndApprove(id: string) {
  const supabase = await createClient();
  await supabase.from("listings").update({ payment_status: "paid", status: "active" }).eq("id", id);
  revalidatePath("/admin");
}

export async function markPaid(id: string) {
  const supabase = await createClient();
  await supabase.from("listings").update({ payment_status: "paid" }).eq("id", id);
  revalidatePath("/admin");
}

export async function blockUser(id: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: false }).eq("id", id);
  revalidatePath("/admin");
}

export async function unblockUser(id: string) {
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: true }).eq("id", id);
  revalidatePath("/admin");
}
