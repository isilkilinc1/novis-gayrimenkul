function Badge({ children, variant = "gold" }) {
  const variants = {
    gold: "bg-novis-gold/15 text-novis-brown border-novis-gold/30",

    dark: "bg-novis-anthracite text-novis-cream border-novis-anthracite",

    bronze: "bg-novis-bronze/15 text-novis-brown border-novis-bronze/30",

    success: "bg-green-100 text-green-800 border-green-200",

    danger: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        border
        px-3 py-1
        text-xs font-semibold
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
