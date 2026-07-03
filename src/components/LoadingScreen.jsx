import { useEffect, useState } from "react";

const STEPS = [
  "Verificando seu acesso...",
  "Validando sua assinatura...",
  "Preparando seu ambiente...",
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current++;

      if (current >= STEPS.length) {
        clearInterval(interval);
        return;
      }

      setStepIndex(current);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        paddingTop: "40px",
        textAlign: "center",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: "800",
          color: "#2563eb",
        }}
      >
        Kisten Decision
      </div>

      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        🔄
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#0f172a",
          minHeight: "24px",
        }}
      >
        {STEPS[stepIndex]}
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "#64748b",
          margin: 0,
        }}
      >
        Estamos analisando suas permissões com segurança.
      </p>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
