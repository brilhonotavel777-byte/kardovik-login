import { supabase } from "./supabase.js";

/**
 * Verifica se o e-mail está autorizado na tabela authorized_users.
 */
async function isEmailAuthorized(email) {
  const { data, error } = await supabase
    .from("authorized_users")
    .select("authorized")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    throw new Error("Erro ao validar autorização de acesso.");
  }

  return data?.authorized === true;
}

/**
 * Envia OTP por e-mail apenas para usuários autorizados.
 */
export async function sendEmailOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();

  const authorized = await isEmailAuthorized(normalizedEmail);

  if (!authorized) {
    throw new Error(
      "Acesso ainda não liberado. Após a confirmação do pagamento, seu acesso será ativado automaticamente."
    );
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
  });

  if (error) {
    throw new Error("Não foi possível enviar o código. Tente novamente.");
  }

  return true;
}

/**
 * Verifica token OTP e retorna { user, session } em caso de sucesso.
 */
export async function verifyEmailOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token,
    type: "email",
  });

  if (error) {
    throw new Error("Código inválido ou expirado.");
  }

  return data;
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

  if (error) {
    throw new Error("Erro ao encerrar sessão.");
  }
}