import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { canAccessSystem, isOwnerOrAdmin } from "./lib/access.js";
import { sendEmailOtp, verifyEmailOtp, getCurrentSession, signOutCurrentUser } from "./lib/auth.js";
import { fetchUserProfileByEmail, ensureUserHasClinic, touchLastLogin } from "./lib/supabase.js";
import Brand from "./components/Brand.jsx";
import LoginStep from "./components/LoginStep.jsx";
import OtpStep from "./components/OtpStep.jsx";
import AccessSuccess from "./components/AccessSuccess.jsx";
import AccessBlocked from "./components/AccessBlocked.jsx";
import ProtectedShell from "./components/ProtectedShell.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import AdminRoute from "./components/admin/AdminRoute.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import ExecutiveCommand from "./pages/admin/ExecutiveCommand.jsx";
import OperationsCenter from "./pages/admin/OperationsCenter.jsx";
import InfrastructureControl from "./pages/admin/InfrastructureControl.jsx";
import RecoveryOps from "./pages/admin/RecoveryOps.jsx";
import EngagementCenter from "./pages/admin/EngagementCenter.jsx";

export default function App() {
  const navigate = useNavigate();

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
  // resolveAccess: valida sessão/perfil/clínica e retorna a
  // rota de destino (string) ou null quando bloqueado.
  // ─────────────────────────────────────────────────────────
  async function resolveAccess(authSession, userProfile) {
    const hasAccess = canAccessSystem(userProfile);

    if (!hasAccess) {
      setSession(authSession);
      setProfile(userProfile);
      setClinic(null);
      return null;
    }

    const { profile: resolvedProfile, clinic: resolvedClinic } =
      await ensureUserHasClinic(userProfile);

    setSession(authSession);
    setProfile(resolvedProfile);
    setClinic(resolvedClinic);

    return isOwnerOrAdmin(resolvedProfile) ? "/admin/executive" : "/app";
  }

  // ── Bootstrap: verificar sessão existente ao carregar ────
  useEffect(() => {
    setLogoVisible(true);

    async function bootstrap() {
      try {
        const existingSession = await getCurrentSession();
        if (existingSession?.user?.email) {
          const userProfile = await fetchUserProfileByEmail(existingSession.user.email);
          const dest = await resolveAccess(existingSession, userProfile);
          if (dest) {
            navigate(dest, { replace: true });
          } else {
            setCurrentStep("blocked");
            navigate("/", { replace: true });
          }
        } else {
          navigate("/", { replace: true });
          setTimeout(() => setContentVisible(true), 110);
        }
      } catch {
        // Sessão inconsistente — retorna ao login silenciosamente
        navigate("/", { replace: true });
        setTimeout(() => setContentVisible(true), 110);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-redirect: success → destino após transição curta ─
  useEffect(() => {
    if (currentStep !== "success") return;
    const dest = isOwnerOrAdmin(profile) ? "/admin/executive" : "/app";
    const t = setTimeout(() => navigate(dest, { replace: true }), 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const dest = await resolveAccess(data.session, userProfile);

    if (dest) {
      touchLastLogin(); // fire-and-forget — não bloqueia nem depende do resultado
      navigate(dest, { replace: true });
    } else {
      setCurrentStep("blocked");
    }
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
      navigate("/", { replace: true });
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

  // ── Roteamento ────────────────────────────────────────────
  return (
    <Routes>
      {/* ── Fluxo de autenticação ──────────────────────────── */}
      <Route
        path="/"
        element={
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
        }
      />

      {/* ── Área autenticada (usuários comuns) ─────────────── */}
      <Route
        path="/app"
        element={
          session
            ? <ProtectedShell
                session={session}
                profile={profile}
                clinic={clinic}
                onLogout={handleLogout}
              />
            : <Navigate to="/" replace />
        }
      />

      {/* ── Área administrativa (role: owner) ──────────────── */}
      <Route
        path="/admin"
        element={<AdminRoute profile={profile} session={session} onLogout={handleLogout} />}
      >
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="executive" replace />} />
          <Route path="executive"      element={<ExecutiveCommand />} />
          <Route path="operations"     element={<OperationsCenter />} />
          <Route path="infrastructure" element={<InfrastructureControl />} />
          <Route path="recovery-ops"   element={<RecoveryOps />} />
          <Route path="engagement"     element={<EngagementCenter />} />
        </Route>
      </Route>

      {/* ── Fallback ───────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
