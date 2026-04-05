import { supabase } from "./supabase.js";

/**
 * Envia OTP por e-mail via Supabase Auth.
 * Lança erro com mensagem amigável em caso de falha.
 */
export async function sendEmailOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw new Error("Não foi possível enviar o código. Tente novamente.");
  return true;
}

/**
 * Verifica token OTP e retorna { user, session } em caso de sucesso.
 * Lança erro com mensagem amigável em caso de falha.
 */
export async function verifyEmailOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw new Error("Código inválido ou expirado.");
  return data; // { user, session }
}

/**
 * Retorna a sessão atual do Supabase Auth.
 */
export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Encerra a sessão atual do usuário.
 */
export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Erro ao encerrar sessão.");
}
