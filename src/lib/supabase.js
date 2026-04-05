import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Usuários ─────────────────────────────────────────────────

/**
 * Busca o perfil do usuário na tabela `usuarios`.
 * Retorna null silenciosamente quando não encontrado (PGRST116).
 */
export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[Kardovik] fetchUserProfile:", error.message);
    return null;
  }
  return data;
}

/**
 * Cria perfil mínimo em `usuarios` para um auth user recém-autenticado.
 *
 * Regra de negócio:
 *   status = "active"          → identidade existe
 *   billing_status = "pending" → acesso NEGADO até Hotmart confirmar
 */
export async function createUserProfile(authUser) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      id: authUser.id,
      email: authUser.email ?? null,
      phone: authUser.phone ?? null,
      status: "active",
      billing_status: "pending",
      access_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return null; // conflito de PK — fetch resolve
    console.error("[Kardovik] createUserProfile:", error.message);
    return null;
  }
  return data;
}

/**
 * Busca o perfil do usuário. Se não existir, cria automaticamente.
 * Criar ≠ liberar acesso. O acesso é decidido por canAccessSystem(profile).
 */
export async function getOrCreateUserProfile(authUser) {
  const existing = await fetchUserProfile(authUser.id);
  if (existing) return existing;

  const created = await createUserProfile(authUser);
  if (created) return created;

  // Cobre race condition (insert 23505) — tenta buscar novamente
  return await fetchUserProfile(authUser.id);
}

// ── Clínicas ─────────────────────────────────────────────────

/**
 * Busca clínica pelo id.
 */
export async function fetchClinicById(clinicaId) {
  const { data, error } = await supabase
    .from("clinicas")
    .select("*")
    .eq("id", clinicaId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[Kardovik] fetchClinicById:", error.message);
    return null;
  }
  return data;
}

/**
 * Cria uma clínica com os dados fornecidos.
 */
export async function createClinic({ nome }) {
  const { data, error } = await supabase
    .from("clinicas")
    .insert({ nome })
    .select()
    .single();

  if (error) {
    console.error("[Kardovik] createClinic:", error.message);
    return null;
  }
  return data;
}

/**
 * Vincula o usuário a uma clínica com o papel especificado.
 */
export async function linkUserToClinic(userId, clinicaId, role = "owner") {
  const { error } = await supabase
    .from("usuarios")
    .update({ clinica_id: clinicaId, role })
    .eq("id", userId);

  if (error) {
    console.error("[Kardovik] linkUserToClinic:", error.message);
  }
}

/**
 * Garante que o usuário autenticado tenha uma clínica vinculada.
 *
 * Se clinica_id já existir: busca e retorna a clínica.
 * Se não existir: cria clínica provisória, vincula e rebusca o perfil.
 *
 * Retorna { profile, clinic } — ambos podem ser null em caso de falha,
 * mas nunca lançam erro (o app continua de forma segura).
 */
export async function ensureUserHasClinic(userProfile) {
  if (userProfile.clinica_id) {
    const clinic = await fetchClinicById(userProfile.clinica_id);
    return { profile: userProfile, clinic };
  }

  // Gera nome provisório a partir do e-mail
  const slug = userProfile.email?.split("@")[0] ?? "usuario";
  const nome =
    "Clínica " + slug.charAt(0).toUpperCase() + slug.slice(1);

  const clinic = await createClinic({ nome });
  if (!clinic) {
    // Criação falhou — segue sem clínica, não quebra o app
    return { profile: userProfile, clinic: null };
  }

  await linkUserToClinic(userProfile.id, clinic.id, "owner");

  // Rebusca perfil para ter clinica_id persistido
  const updatedProfile = (await fetchUserProfile(userProfile.id)) ?? userProfile;
  return { profile: updatedProfile, clinic };
}
