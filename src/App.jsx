import { useState, useEffect } from "react";
import { canAccessSystem } from "./lib/access.js";
import { sendEmailOtp, verifyEmailOtp, getCurrentSession, signOutCurrentUser } from "./lib/auth.js";
import { fetchUserProfileByEmail, ensureUserHasClinic } from "./lib/supabase.js";
import Brand from "./components/Brand.jsx";
import LoginStep from "./components/LoginStep.jsx";
import OtpStep from "./components/OtpStep.jsx";
import AccessSuccess from "./components/AccessSuccess.jsx";
import AccessBlocked from "./components/AccessBlocked.jsx";
import ProtectedShell from "./components/ProtectedShell.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

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
    const hasAccess = canAccessSystem(userProfile);

    if (!hasAccess) {
      setSession(authSession);
      setProfile(userProfile);
      setClinic(null);
      return false;
    }

    const { profile: resolvedProfile, clinic: resolvedClinic } =
      await ensureUserHasClinic(userProfile);

    setSession(authSession);
    setProfile(resolvedProfile);
    setClinic(resolvedClinic);

    return true;
  }

  // ── Bootstrap: verificar sessão existente ao carregar ────
  useEffect(() => {
    setLogoVisible(true);

    async function bootstrap() {
      try {
        const existingSession = await getCurrentSession();
        if (existingSession?.user?.email) {
          const userProfile = await fetchUserProfileByEmail(existingSession.user.email);
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
    const email = data?.user?.email;
    if (!email) throw new Error("Erro ao autenticar. Email do usuário não encontrado.");

    const userProfile = await fetchUserProfileByEmail(email);
    const hasAccess = await resolveAccess(data.session, userProfile);
    setCurrentStep(hasAccess ? "app" : "blocked");
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
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <LoadingScreen />
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
          <Brand size="lg" />
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
        {currentStep === "blocked" && (
          <AccessBlocked profile={profile} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
