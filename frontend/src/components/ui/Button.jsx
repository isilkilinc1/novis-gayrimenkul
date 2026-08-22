function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false, // <-- disabled özelliğini ekledik
  className = "",
}) {
  const variants = {
    primary:
      "bg-novis-gold text-novis-anthracite hover:bg-novis-bronze hover:text-novis-cream",
    secondary:
      "border border-novis-gold text-novis-gold hover:bg-novis-gold hover:text-novis-anthracite",
    dark: "bg-novis-anthracite text-novis-cream hover:bg-novis-brown",
    ghost: "text-novis-anthracite hover:bg-novis-cream",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-7 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled} // <-- HTML button'a bağladık
      className={`
        inline-flex items-center justify-center
        rounded-lg font-semibold
        transition-colors duration-200 cursor-pointer
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
