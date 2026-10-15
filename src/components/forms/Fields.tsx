import {
  useId,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      {children}
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};
export function TextInput({ label, error, id, ...props }: InputProps) {
  const auto = useId();
  const key = id ?? auto;
  return (
    <div className="space-y-1.5">
      <label htmlFor={key} className="block text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        id={key}
        className="w-full"
        aria-invalid={!!error}
        aria-describedby={error ? `${key}-error` : undefined}
      />
      {error && (
        <p id={`${key}-error`} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
export function NumberInput(props: InputProps) {
  return <TextInput min={0} step="any" {...props} type="number" />;
}
export function Select({
  label,
  error,
  children,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
}) {
  const auto = useId();
  const key = id ?? auto;
  return (
    <div className="space-y-1.5">
      <label htmlFor={key} className="block text-sm font-medium">
        {label}
      </label>
      <select
        {...props}
        id={key}
        className="w-full"
        aria-invalid={!!error}
        aria-describedby={error ? `${key}-error` : undefined}
      >
        {children}
      </select>
      {error && (
        <p id={`${key}-error`} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
export function Textarea({
  label,
  error,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  const auto = useId();
  const key = id ?? auto;
  return (
    <div className="space-y-1.5">
      <label htmlFor={key} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        {...props}
        id={key}
        className="w-full rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        aria-invalid={!!error}
        aria-describedby={error ? `${key}-error` : undefined}
      />
      {error && (
        <p id={`${key}-error`} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
export function Switch({ label, ...props }: InputProps) {
  const key = useId();
  return (
    <label htmlFor={key} className="flex items-center gap-3">
      <input {...props} id={key} type="checkbox" role="switch" />
      {label}
    </label>
  );
}
