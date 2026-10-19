import { T } from "../../i18n/T";
import { useRef, useState } from "react";
export function VerificationCode() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-medium"><T text={"Verification code"}/></legend>
      <div className="flex gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            name={`digit-${i}`}
            aria-label={`Digit ${i + 1}`}
            value={digit}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            className="h-12 min-w-0 flex-1 px-0 text-center text-lg font-semibold"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(-1);
              setDigits((s) => s.map((d, index) => (index === i ? value : d)));
              if (value) inputs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digit)
                inputs.current[i - 1]?.focus();
              if (e.key === "ArrowLeft") inputs.current[i - 1]?.focus();
              if (e.key === "ArrowRight") inputs.current[i + 1]?.focus();
            }}
            onPaste={(e) => {
              e.preventDefault();
              const code = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);
              setDigits(Array.from({ length: 6 }, (_, j) => code[j] ?? ""));
              inputs.current[Math.min(code.length, 5)]?.focus();
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}
