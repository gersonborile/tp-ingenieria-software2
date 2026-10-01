import type { ReactNode } from "react";

type TarjetaAuthProps = {
  titulo: string;
  children: ReactNode;
  pie?: ReactNode;
};

export function TarjetaAuth({ titulo, children, pie }: TarjetaAuthProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-100 px-6 py-16 text-neutral-900">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-200 text-base font-semibold text-neutral-800"
          >
            CD
          </span>
          <p className="text-xs tracking-wide text-neutral-500">
            Club Deportivo · Reservas
          </p>
        </div>

        <h1 className="mt-6 text-center text-xl font-semibold tracking-tight">
          {titulo}
        </h1>

        <div className="mt-6">{children}</div>

        {pie ? <div className="mt-6 text-center text-sm">{pie}</div> : null}
      </div>
    </main>
  );
}

type AvisoProps = {
  tono: "error" | "exito";
  children: ReactNode;
};

export function Aviso({ tono, children }: AvisoProps) {
  const estilos =
    tono === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <p role="alert" className={`rounded-lg border px-3 py-2 text-sm ${estilos}`}>
      {children}
    </p>
  );
}

type CampoProps = {
  id: string;
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (valor: string) => void;
};

export function Campo({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  value,
  error,
  onChange,
}: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(evento) => onChange(evento.target.value)}
        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 ${
          error ? "border-red-300 bg-red-50/40" : "border-neutral-300 bg-white"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
