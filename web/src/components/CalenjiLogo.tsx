interface CalenjiLogoProps {
  size?: number;
  className?: string;
}

export default function CalenjiLogo({ size = 24, className = "" }: CalenjiLogoProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: `${size}px`,
        color: "#111",
        letterSpacing: "-0.5px",
        lineHeight: 1,
      }}
    >
      Calenji
    </span>
  );
}
