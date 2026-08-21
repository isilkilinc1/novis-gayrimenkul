function Card({ children, className = "" }) {
  return (
    <div
      className={`
        overflow-hidden
        rounded-2xl
        border border-novis-bronze/20
        bg-white
        shadow-sm
        transition-shadow duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
