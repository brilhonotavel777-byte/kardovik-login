import { useState } from "react";

export default function LoginStep({ contentVisible, isSubmitting, loginError, onContinue }) {
  const [inputValue, setInputValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);

  function handleInputChange(e) {
    setInputValue(e.target.value);
  }

  function handleContinue() {
    if (!isValid || isSubmitting) return;
    onContinue("email", inputValue);
  }

  return (
    <div
      style={{
        opacity: contentVisible ? 1 : 0,
        transform: contentVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
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
        Acesse sua área
      </h1>

      <p
        style={{
          fontSize: "17px",
          lineHeight: 1.5,
          color: "#64748b",
          margin: "0 0 30px 0",
        }}
      >
        Digite seu e-mail empresarial para continuar
      </p>

      <div style={{ width: "100%", marginBottom: "14px" }}>
        <input
          type="email"
          placeholder="seuemail@empresa.com"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          style={{
            width: "100%",
            height: "58px",
            borderRadius: "16px",
            border: inputFocused
              ? "1px solid #2563eb"
              : inputValue
              ? "1px solid #94a3b8"
              : "1px solid #dbe2ea",
            background: "#ffffff",
            boxShadow: inputValue
              ? "0 4px 18px rgba(15,23,42,0.09)"
              : "0 4px 14px rgba(15,23,42,0.05)",
            padding: "0 18px",
            fontSize: "16px",
            color: "#0f172a",
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.2s ease",
          }}
        />
      </div>

      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#94a3b8",
          margin: loginError ? "0 0 10px 0" : "0 0 22px 0",
        }}
      >
        Sem senha. Acesso rápido e seguro.
      </p>

      {loginError && (
        <p
          style={{
            fontSize: "13px",
            color: "#ef4444",
            margin: "0 0 16px 0",
            lineHeight: 1.5,
            transition: "all 0.2s ease",
          }}
        >
          {loginError}
        </p>
      )}

      <button
        disabled={!isValid || isSubmitting}
        onClick={handleContinue}
        onMouseOver={() => isValid && !isSubmitting && setBtnHovered(true)}
        onMouseOut={() => setBtnHovered(false)}
        onMouseDown={(e) => {
          if (isValid && !isSubmitting)
            e.currentTarget.style.transform = "translateY(1px)";
        }}
        onMouseUp={(e) => {
          if (isValid && !isSubmitting)
            e.currentTarget.style.transform = "translateY(0)";
        }}
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
          cursor: isValid && !isSubmitting ? "pointer" : "not-allowed",
          boxShadow:
            isValid && !isSubmitting
              ? "0 10px 28px rgba(59,130,246,0.24)"
              : "0 4px 12px rgba(59,130,246,0.10)",
          marginBottom: "14px",
          transition: "all 0.25s ease",
          transform: isValid && btnHovered ? "translateY(-1px)" : "translateY(0)",
          opacity: isValid ? 1 : 0.5,
        }}
      >
        {isSubmitting ? "Enviando código..." : "Continuar"}
      </button>

      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#94a3b8",
          margin: "0 0 26px 0",
        }}
      >
        Enviamos um código em segundos
      </p>

      {/* DIVISOR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>
          ou
        </span>
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
      </div>

      {/* BOTÃO GOOGLE */}
      <button
        style={{
          width: "100%",
          height: "58px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          color: "#0f172a",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
          marginBottom: "34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "20px" }}>G</span>
        <span>Continuar com Google</span>
      </button>

      <p
        style={{
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#94a3b8",
          margin: 0,
        }}
      >
        Seus dados protegidos • Ambiente seguro
      </p>
    </div>
  );
}
