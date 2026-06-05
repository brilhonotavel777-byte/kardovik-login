import { supabase } from "./supabase.js";

export async function fetchAdminOperations() {
  const { data, error } = await supabase.rpc("get_admin_operations");
  if (error) {
    console.error("[Kardovik Admin] fetchAdminOperations:", error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}
