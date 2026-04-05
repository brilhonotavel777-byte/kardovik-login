export default function AccessSuccess() {
  return (
    <div>
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          fontSize: "24px",
        }}
      >
        ✓
      </div>

      <h1
        style={{
          fontSize: "28px",
          fontWeight: "750",
          lineHeight: 1.1,
          color: "#0f172a",
          margin: "0 0 12px 0",
          letterSpacing: "-0.5px",
        }}
      >
        Acesso liberado
      </h1>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#64748b",
          margin: 0,
        }}
      >
        {/* TODO: redirecionar para o dashboard após integração real */}
        Verificação concluída. Redirecionando...
      </p>
    </div>
  );
}
