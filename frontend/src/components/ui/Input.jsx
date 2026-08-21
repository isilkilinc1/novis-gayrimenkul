function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  required = false,
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-novis-anthracite"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full rounded-lg
          border border-novis-bronze/30
          bg-white px-4 py-3
          text-novis-anthracite
          outline-none
          transition
          focus:border-novis-gold
          focus:ring-2
          focus:ring-novis-gold/20
        "
      />
    </div>
  );
}

export default Input;
