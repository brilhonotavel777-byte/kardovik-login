import { useState, useEffect, useRef } from "react";

export default function OtpStep({ authType, authValue, onVerify, onResend, onBack }) {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const otpRefs = useRef([]);

  const isOtpComplete = otpValues.every((v) => v !== "");

  // Animação de entrada
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Timer de reenvio — reseta a cada resendCount
  useEffect(() => {
    setResendTimer(30);
    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [resendCount]);

  function handleChange(index, e) {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otpValues];
    next[index] = val;
    setOtpValues(next);
    if (otpError) setOtpError(null);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (!isOtpComplete || isVerifying) return;
    setIsVerifying(true);
    setOtpError(null);
    try {
      await onVerify(otpValues.join(""));
      // Sucesso: App muda currentStep → este componente é desmontado
    } catch (err) {
      setOtpError(err.message);
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (isResending) return;
    setIsResending(true);
    setOtpError(null);
    try {
      await onResend();
    } finally {
      setIsResending(false);
      setResendCount((c) => c + 1);
    }
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "750",
          lineHeight: 1.08,
          color: "#0f172a",
          margin: "0 0 12px 0",
          letterSpacing: "-1px",
        }}
      >
        Digite o código
      </h1>

      <p
        style={{
          fontSize: "17px",
          lineHeight: 1.5,
          color: "#64748b",
          margin: "0 0 6px 0",
        }}
      >
        {authType === "phone"
          ? "Enviamos um código para seu celular"
          : "Enviamos um código para seu e-mail"}
      </p>

      <p
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#0f172a",
          margin: "0 0 32px 0",
        }}
      >
        {authValue}
      </p>

      {/* 6 CAMPOS OTP */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: otpError ? "16px" : "28px",
        }}
      >
        {otpValues.map((val, i) => (
          <input
            key={i}
            ref={(el) => (otpRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isVerifying}
            style={{
              width: "48px",
              height: "58px",
              borderRadius: "14px",
              border: otpError
                ? "1px solid #ef4444"
                : val
                ? "1px solid #2563eb"
                : "1px solid #dbe2ea",
              background: "#ffffff",
              boxShadow: otpError
                ? "0 4px 14px rgba(239,68,68,0.10)"
                : val
                ? "0 4px 14px rgba(37,99,235,0.12)"
                : "0 4px 14px rgba(15,23,42,0.05)",
              fontSize: "22px",
              fontWeight: "700",
              color: "#0f172a",
              textAlign: "center",
              outline: "none",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* ERRO */}
      {otpError && (
        <p
          style={{
            fontSize: "13px",
            color: "#ef4444",
            margin: "0 0 20px 0",
            lineHeight: 1.5,
          }}
        >
          {otpError}
        </p>
      )}

      {/* BOTÃO VERIFICAR */}
      <button
        disabled={!isOtpComplete || isVerifying}
        onClick={handleVerify}
        style={{
          width: "100%",
          height: "58px",
          borderRadius: "16px",
          border: "none",
          background:
            "linear-gradient(90deg, #1da1f2 0%, #2563eb 50%, #5b3df5 100%)",
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: "700",
          cursor: isOtpComplete && !isVerifying ? "pointer" : "not-allowed",
          boxShadow:
            isOtpComplete && !isVerifying
              ? "0 10px 28px rgba(59,130,246,0.24)"
              : "0 4px 12px rgba(59,130,246,0.10)",
          marginBottom: "20px",
          transition: "all 0.25s ease",
          opacity: isOtpComplete && !isVerifying ? 1 : 0.5,
        }}
      >
        {isVerifying ? "Verificando..." : "Verificar"}
      </button>

      {/* REENVIO */}
      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#94a3b8",
          margin: "0 0 24px 0",
        }}
      >
        {resendTimer > 0 ? (
          `Reenviar código em ${resendTimer}s`
        ) : isResending ? (
          "Enviando..."
        ) : (
          <button
            onClick={handleResend}
            style={{
              background: "none",
              border: "none",
              fontSize: "13px",
              fontWeight: "600",
              color: "#2563eb",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Reenviar código
          </button>
        )}
      </p>

      {/* VOLTAR */}
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          fontSize: "14px",
          fontWeight: "600",
          color: "#64748b",
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "8px",
          transition: "color 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = "#0f172a")}
        onMouseOut={(e) => (e.currentTarget.style.color = "#64748b")}
      >
        ← Voltar
      </button>
    </div>
  );
}
