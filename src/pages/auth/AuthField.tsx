import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
  minLength,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  minLength?: number;
  defaultValue?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
      <span className="mb-2 block">{label}</span>
      <span className="relative block">
        <input
          name={name}
          type={type === "password" && show ? "text" : type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          minLength={minLength}
          className="w-full py-2.5 pr-10"
          placeholder={
            type === "password"
              ? "Enter your password"
              : label === "Email address"
                ? "you@example.com"
                : "Your full name"
          }
        />
        {type === "password" && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-slate-400"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </span>
    </label>
  );
}
