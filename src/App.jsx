import { useState, useEffect } from "react";
import { canAccessSystem } from "./lib/access.js";
import { sendEmailOtp, verifyEmailOtp, getCurrentSession, signOutCurrentUser } from "./lib/auth.js";
import { getOrCreateUserProfile, ensureUserHasClinic } from "./lib/supabase.js";
import LoginStep from "./components/LoginStep.jsx";
import OtpStep from "./components/OtpStep.jsx";
import AccessSuccess from "./components/AccessSuccess.jsx";
import AccessBlocked from "./components/AccessBlocked.jsx";
import ProtectedShell from "./components/ProtectedShell.jsx";

export default function App() {
  // ── Sessão, perfil e clínica ─────────────────────────────
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // ── Fluxo ────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState("login");
  const [authType, setAuthType] = useState("");
  const [authValue, setAuthValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // ── Animação da logo ─────────────────────────────────────
  const [logoVisible, setLogoVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // ─────────────────────────────────────────────────────────
  // resolveAccess: define estados de sessão/perfil/clínica e
  // retorna true (acesso liberado) ou false (bloqueado).
  // Não toca em currentStep — cabe ao caller decidir o step.
  // ─────────────────────────────────────────────────────────
  async function resolveAccess(authSession, userProfile) {
    if (!canAccessSystem(userProfile)) {
      setSession(authSession);
      setProfile(userProfile);
      return false;
    }
    const { profile: finalProfile, clinic: userClinic } =
      await ensureUserHasClinic(userProfile);
    setSession(authSession);
    setProfile(finalProfile);
    setClinic(userClinic);
    return true;
  }

  // ── Bootstrap: verificar sessão existente ao carregar ────
  useEffect(() => {
    setLogoVisible(true);

    async function bootstrap() {
      try {
        const existingSession = await getCurrentSession();
        if (existingSession?.user) {
          const userProfile = await getOrCreateUserProfile(existingSession.user);
          const hasAccess = await resolveAccess(existingSession, userProfile);
          setCurrentStep(hasAccess ? "app" : "blocked");
        } else {
          setTimeout(() => setContentVisible(true), 110);
        }
      } catch {
        // Sessão inconsistente — retorna ao login silenciosamente
        setTimeout(() => setContentVisible(true), 110);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-redirect: success → app após transição curta ────
  useEffect(() => {
    if (currentStep !== "success") return;
    const t = setTimeout(() => setCurrentStep("app"), 1500);
    return () => clearTimeout(t);
  }, [currentStep]);

  // ── Handlers ─────────────────────────────────────────────

  async function handleContinue(type, value) {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await sendEmailOtp(value);
      setAuthType(type);
      setAuthValue(value);
      setCurrentStep("otp");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerified(code) {
    // Lança erro se inválido — capturado em OtpStep
    const data = await verifyEmailOtp(authValue, code);
    const userId = data?.user?.id;
    if (!userId) throw new Error("Erro ao autenticar. Tente novamente.");

    const userProfile = await getOrCreateUserProfile(data.user);
    const hasAccess = await resolveAccess(data.session, userProfile);
    setCurrentStep(hasAccess ? "success" : "blocked");
  }

  async function handleResend() {
    await sendEmailOtp(authValue);
  }

  function handleBack() {
    setCurrentStep("login");
    setLoginError(null);
  }

  async function handleLogout() {
    try {
      await signOutCurrentUser();
    } catch {
      // Encerra localmente mesmo se a chamada remota falhar
    } finally {
      setSession(null);
      setProfile(null);
      setClinic(null);
      setAuthType("");
      setAuthValue("");
      setLoginError(null);
      setCurrentStep("login");
      setContentVisible(false);
      setTimeout(() => setContentVisible(true), 110);
    }
  }

  // ── Loading durante bootstrap ─────────────────────────────
  if (isBootstrapping) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "#ffffff",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          paddingTop: "64px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center", padding: "0 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "32px",
              opacity: logoVisible ? 1 : 0,
              transform: logoVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
            }}
          >
            <img
              src="/logo-kardovik.png"
              alt="Kardovik"
              style={{ height: "160px", maxWidth: "100%", objectFit: "contain", display: "block", userSelect: "none", pointerEvents: "none" }}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#cbd5e1", margin: 0 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  // ── Área autenticada ──────────────────────────────────────
  if (currentStep === "app") {
    return (
      <ProtectedShell
        session={session}
        profile={profile}
        clinic={clinic}
        onLogout={handleLogout}
      />
    );
  }

  // ── Fluxo de auth ─────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "#ffffff",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingTop: "64px",
        paddingLeft: "20px",
        paddingRight: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "8px 4px 24px 4px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "32px",
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          <img
            src="/logo-kardovik.png"
            alt="Kardovik"
            style={{ height: "160px", maxWidth: "100%", objectFit: "contain", display: "block", userSelect: "none", pointerEvents: "none" }}
          />
        </div>

        {currentStep === "login" && (
          <LoginStep
            contentVisible={contentVisible}
            isSubmitting={isSubmitting}
            loginError={loginError}
            onContinue={handleContinue}
          />
        )}
        {currentStep === "otp" && (
          <OtpStep
            authType={authType}
            authValue={authValue}
            onVerify={handleVerified}
            onResend={handleResend}
            onBack={handleBack}
          />
        )}
        {currentStep === "success" && <AccessSuccess />}
        {currentStep === "blocked" && <AccessBlocked onBack={handleBack} />}
      </div>
    </div>
  );
}
