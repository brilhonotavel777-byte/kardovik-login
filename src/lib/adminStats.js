import { supabase } from "./supabase.js";

export async function fetchAdminStats() {
  const { data, error } = await supabase.rpc("get_admin_stats");
  if (error) {
    console.error("[Kardovik Admin] fetchAdminStats:", error.message);
    return null;
  }
  return data;
}
