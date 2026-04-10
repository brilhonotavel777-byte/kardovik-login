const SIZES = {
  sm: { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em" },
  md: { fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em" },
  lg: { fontSize: "38px", fontWeight: "700", letterSpacing: "-0.02em" },
};

export default function Brand({ size = "md", style }) {
  const base = SIZES[size] ?? SIZES.md;
  return (
    <span
      style={{
        ...base,
        color: "#1d4ed8",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        userSelect: "none",
        lineHeight: 1,
        ...style,
      }}
    >
      Kardovik
    </span>
  );
}
