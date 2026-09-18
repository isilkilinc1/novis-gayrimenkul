import { useState } from "react";

function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  required = false,
  readOnly = false,
  className = "",
  isPassword: explicitIsPassword,
  showPassword: controlledShowPassword,
  onTogglePassword,
}) {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  // type="password" veya açıkça şifre alanı olarak belirtilmişse
  const isPasswordField =
    explicitIsPassword !== undefined
      ? explicitIsPassword
      : type === "password" || (controlledShowPassword !== undefined && (type === "password" || type === "text"));

  const isPasswordVisible =
    controlledShowPassword !== undefined
      ? controlledShowPassword
      : internalShowPassword;

  const effectiveType = isPasswordField
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTogglePassword) {
      onTogglePassword();
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

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

      <div className="relative w-full">
        <input
          id={name}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          className={`
            w-full rounded-lg
            border border-novis-bronze/30
            bg-white px-4 py-3
            text-novis-anthracite
            outline-none
            transition
            focus:border-novis-gold
            focus:ring-2
            focus:ring-novis-gold/20
            ${isPasswordField ? "pr-12" : ""}
            ${className}
          `}
        />

        {isPasswordField && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleToggle}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-novis-anthracite hover:bg-gray-100 transition cursor-pointer select-none focus:outline-none"
            title={isPasswordVisible ? "Şifreyi Gizle" : "Şifreyi Göster"}
            aria-label={isPasswordVisible ? "Şifreyi Gizle" : "Şifreyi Göster"}
          >
            {isPasswordVisible ? (
              // Eye Slash Icon (Gizle)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              // Eye Icon (Göster)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default Input;
